import trycatch from "../middlewares/trycatch.js";
import sanitize from "mongo-sanitize";
import { prisma } from "../config/prisma.js";
import { userRegistrationSchema, userLoginSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import bcrypt from "bcrypt";
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { generateToken } from "../config/generateToken.js";

export const registerUser = trycatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);

  const validation = userRegistrationSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const zodError = validation.error;
    let firstErrorMessage = "Validation error";
    let allErrors = [];
    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation error",
        code: issue.code || "invalid",
      }));
      firstErrorMessage = allErrors[0]?.message || "Validation error";
    }

    return res.status(400).json({
      message: firstErrorMessage,
      errors: allErrors,
    });
  }

  const { email, name, password, mobile, role, referred_by } = validation.data;

  // // implementing rate limiting using Redis can be done here
  // const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
  // if (await redisClient.get(rateLimitKey)) {
  //   return res.status(429).json({
  //     message: "Too many registration attempts. Please try again later.",
  //   });
  // }

  // check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    email,
    name,
    password: hashedPassword,
    mobile,
    role,
    referred_by,
  };

  //  OTP MUST BE STRING
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const registerOtpKey = `register-otp:${email}`;

  await redisClient.set(registerOtpKey, JSON.stringify({ otp, userData }), {
    EX: 300,
  }); // 5 minutes
  console.log(registerOtpKey, otp);

  await sendMail({
    email,
    subject: "Your Resister OTP",
    html: getOtpHtml({ otp }),
  });

  // await redisClient.set(rateLimitKey, "1", { EX: 60 });

  return res.status(200).json({
    message: "OTP sent to your email. Valid for 5 minutes.",
  });
});

export const verifyOTPRegister = trycatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  // Retrieve OTP and user data from Redis
  const otpKey = `register-otp:${email}`;
  const otpDataJson = await redisClient.get(otpKey);

  if (!otpDataJson) {
    return res.status(400).json({
      message: "OTP expired or not found. Please register again.",
    });
  }

  const otpData = JSON.parse(otpDataJson);

  // Verify OTP
  if (otpData.otp !== otp.toString()) {
    return res.status(400).json({
      message: "Invalid OTP. Please enter the correct OTP.",
    });
  }

  // OTP is correct, get user data
  const userData = otpData.userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    await redisClient.del(otpKey); // Clean up OTP
    return res.status(400).json({
      message: "User with this email already exists",
    });
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      password: userData.password,
      mobile: userData.mobile,
      role: userData.role || "USER",
      refferred_by: userData.referred_by || null,
    },
  });

  // Generate tokens and set cookies for login
  await generateToken(newUser.id, res);

  // Clean up OTP from Redis
  await redisClient.del(otpKey);

  res.status(201).json({
    message: "User registered and logged in successfully",
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      mobile: newUser.mobile,
      role: newUser.role,
    },
  });
});
