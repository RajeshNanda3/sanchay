import trycatch from "../middlewares/trycatch.js";
import sanitize from "mongo-sanitize";
import { prisma } from "../config/prisma.js";
import { userRegistrationSchema, userLoginSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
// import cloudinary from "../middlewares/cloudinary.js";
// import {uploadOnCloudinary} from "../services/cloudinay.js";
import cloudinary from "../services/cloudinaryService.js";
import fs from "fs";
// import { get } from "http";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import {
  generateAccessToken,
  generateToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from "../config/generateToken.js";
import {
  generateCSRFToken,
  revokeCSRFTOKEN,
} from "../config/csrfMiddleware.js";
import { generateOTP, getOTPProvider } from "../config/sendOTP.js";

export const registerUser = trycatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  // console.log(sanitizedBody);

  const validation = userRegistrationSchema.safeParse(sanitizedBody);
  // const { email, name, password, mobile } = req.body;

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

  // implementing rate limiting using Redis can be done here
  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many registration attempts. Please try again later.",
    });
  }
  // console.log("passed rate limit2");

  // check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  // console.log("hii Rajesh");
  // console.log(existingUser);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  // hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP instead of verification token
  const otp = generateOTP();
  const otpKey = `register-otp:${mobile}`;

  // Store registration data with OTP
  const datatoStore = JSON.stringify({
    email,
    name,
    password: hashedPassword,
    mobile,
    role,
    referred_by: referred_by || null,
  });

  // Store OTP and user data in Redis (15 minutes expiration)
  await redisClient.set(
    otpKey,
    JSON.stringify({ otp, userData: datatoStore }),
    { EX: 900 },
  );

  // Send OTP via SMS
  const sendOTP = getOTPProvider();
  const otpSent = await sendOTP(mobile, otp);

  if (!otpSent) {
    return res.status(500).json({
      message: "Failed to send OTP. Please try again later.",
    });
  }

  await redisClient.set(rateLimitKey, "true", { EX: 60 }); // 1 minute rate limit

  // Return success with mobile number (masked for security)
  const maskedMobile = mobile.replace(/(\d{2})(\d{4})(\d{4})/, "$1****$3");

  res.status(201).json({
    message: `OTP has been sent to your mobile number ${maskedMobile}. Please verify to complete registration. OTP will expire in 15 minutes.`,
    mobile: maskedMobile,
    expiresIn: 900,
  });
});

export const verifyUser = trycatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }
  const verifyKey = `verify:${token}`;
  const userDataJson = await redisClient.get(verifyKey);
  if (!userDataJson) {
    return res
      .status(400)
      .json({ message: "Verification Link is expired or invalid" });
  }

  await redisClient.del(verifyKey); // Delete the token after use to prevent reuse
  const userData = JSON.parse(userDataJson);
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // const { email, name, password, mobile } = JSON.parse(userDataJson);

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
  await redisClient.del(verifyKey);
  res.status(201).json({
    message: "User verified and registered successfully",
    user: {
      _id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      mobile: newUser.mobile,
    },
  });
});

/**
 * Verify OTP and complete registration
 */
export const verifyOTPRegister = trycatch(async (req, res) => {
  const { mobile, email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Mobile number and OTP are required",
    });
  }

  // Retrieve OTP and user data from Redis
  const otpKey = `register-otp:${mobile}`;
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

  // OTP is correct, parse user data
  const userData = JSON.parse(otpData.userData);

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

  // Clean up OTP from Redis
  await redisClient.del(otpKey);

  res.status(201).json({
    message: "User registered and verified successfully",
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      mobile: newUser.mobile,
      role: newUser.role,
    },
  });
});

// export const loginUser = trycatch(async (req, res) => {
//   const sanitizedBody = sanitize(req.body);

//   const validation = userLoginSchema.safeParse(sanitizedBody);

//   if (!validation.success) {
//     const zodError = validation.error;
//     let firstErrorMessage = "Validation error";
//     let allErrors = [];
//     if (zodError?.issues && Array.isArray(zodError.issues)) {
//       allErrors = zodError.issues.map(issue => ({
//         field: issue.path?issue.path.join('.'):"unknown",
//         message: issue.message || "Validation error",
//         code : issue.code || "invalid"
//       }));
//       firstErrorMessage = allErrors[0]?.message || "Validation error";
//     }

//     return res.status(400).json({
//       message: firstErrorMessage,
//       errors: allErrors
//     });
//   }
//   const { email, password } = validation.data;

//   const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;
//   if (await redisClient.get(rateLimitKey)) {
//     return res.status(429).json({ message: "Too many registration attempts. Please try again later." });
//   }

//   const user = await prisma.user.findUnique({ where: { email } });

//   if (!user) {
//     return res.status(400).json({ message: "Invalid email or password" });
//   }
//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     return res.status(400).json({ message: "Invalid email or password" });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const otpKey = `otp:${email}`;
//   await redisClient.set(otpKey,JSON.stringify(otp),{
//     EX: 300
//   }); // OTP valid for 5 minutes

//  const subject = "Your OTP for Login";

//   const html = getOtpHtml({ email, otp });

//   await sendMail({
//     email,
//     subject,
//     html
//  })

//  await redisClient.set(rateLimitKey, "true", { EX: 60 }); // 1 minute rate limit

//   res.status(200).json({ message: "If your email is valid, an OTP has been sent to your email. It will expire in 5 minutes." });

// }
// );

// export const verifyOtp = trycatch(async (req, res) => {
//   const { email, otp } = req.body;
//   console.log(req.body)
//   console.log(email)
//   console.log(otp)

//   if (!email || !otp) {
//     return res.status(400).json({ message: "Please provide email and OTP" });
//   }
//   const otpKey = `otp:${email}`;
//   console.log(otpKey, "otpKey")
//   const storedOtpString = await redisClient.get(otpKey);
//   const parsedOtp = storedOtpString;
//   console.log(parsedOtp)
//   if (!parsedOtp) {
//     return  res.status(400).json({ message: "OTP is expired or invalid" });
//   }

//   // const storedOtp = JSON.parse(parsedOtp);
//   if (parsedOtp !== parseInt(otp)) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   await redisClient.del(otpKey); // Delete OTP after successful verification
//   let user = await prisma.user.findUnique({ where: { email } });
//   const tokenData = await generateToken(user.id, res);

//   res.status(200).json({
//     message: `Welcome back, ${user.name}`,
//     user: {_id: user.id, email: user.email, name: user.name, mobile: user.mobile},
//     token: tokenData.token
//   });
// });
export const loginUser = trycatch(async (req, res) => {
  const { email, password } = sanitize(req.body);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const rateLimitKey = `login:${req.ip}:${email}`;
  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({ message: "Too many attempts. Try later." });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  //  OTP MUST BE STRING
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 }); // 5 minutes
  console.log(otpKey, otp);

  await sendMail({
    email,
    subject: "Your Login OTP",
    html: getOtpHtml({ otp }),
  });

  await redisClient.set(rateLimitKey, "1", { EX: 60 });

  return res.status(200).json({
    message: "OTP sent to your email. Valid for 5 minutes.",
  });
});

/* ===================== VERIFY OTP ===================== */

export const verifyOtp = trycatch(async (req, res) => {
  const { email, otp } = req.body;
  console.log(otp, "hii1");
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const otpKey = `otp:${email}`;
  const storedOtpString = await redisClient.get(otpKey);
  console.log(otpKey, "1", "", storedOtpString);

  if (!storedOtpString) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }

  const storedOtp = JSON.parse(storedOtpString);
  console.log(storedOtp, typeof storedOtp);
  console.log(otp, typeof otp);
  const modifiedOtp = Number(otp);
  //  STRING vs STRING
  if (storedOtp !== modifiedOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  console.log("checked and proceed furthur");
  await redisClient.del(otpKey);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  console.log(user);
  //  SAFE TOKEN GENERATION
  const tokenData = await generateToken(user.id, res);
  console.log(tokenData);

  return res.status(200).json({
    message: `Welcome ${user.name}`,
    token: tokenData.accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      points: user.points,
    },
  });
});

export const myProfile = trycatch(async (req, res) => {
  const user = req.user;

  // Regenerate CSRF token for authenticated session
  // const { generateCSRFToken } = await import("../config/csrfMiddleware.js");
  // await generateCSRFToken(user.id, res);

  const cacheKey = `profile:${user.id}`;

  // Try to get from cache first
  const cachedUser = await redisClient.get(cacheKey);
  if (cachedUser) {
    const userData = JSON.parse(cachedUser);
    return res.json({ user: userData });
  }

  // If not in cache, fetch from database
  const freshUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      points: true,
      created_at: true,
      updated_at: true,
      userProfile: true,
      vendorProfile: {
        select: {
          store_name: true,
          avatar: true,
        },
      },
    },
  });

  // Store in cache for future requests (e.g., 10 minutes)
  await redisClient.set(cacheKey, JSON.stringify(freshUser), { EX: 600 });

  res.json({ user: freshUser });
});

// fetch extended profile for current user
export const getProfile = trycatch(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      points: true,
      created_at: true,
      updated_at: true,
    },
  });
  if (!user) return res.status(404).json({ message: "User not found" });

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: userId },
  });

  res
    .status(200)
    .json({ message: "Profile fetched", user, profile: profile || null });
});

// create or update current user's profile, handle avatar via memory multer + cloudinary
// export const upsertProfile = trycatch(async (req, res) => {
//   const userId = req.user.id;
//   console.log(userId)
//   const { age, address_at, address_po, address_market, address_dist, address_pin } = req.body || {};
//   const data = {
//     age: age ? parseInt(age, 10) : null,
//     address_at: address_at || null,
//     address_po: address_po || null,
//     address_market: address_market || null,
//     address_dist: address_dist || null,
//     address_pin: address_pin || null,
//   };

//   if (req.file && req.file.buffer) {
//     try {
//       const { uploadToCloudinary } = await import("../middlewares/cloudinary.js");
//       const result = await uploadToCloudinary(req.file.buffer, {
//         folder: "user_profiles",
//         resource_type: "image",
//         public_id: `user_${userId}_${Date.now()}`,
//         overwrite: true,
//       });
//       data.avatar = result.secure_url;
//     } catch (err) {
//       console.error("Cloudinary upload failed", err);
//     }
//   }

//   const profile = await prisma.userProfile.upsert({
//     where: { user_id: userId },
//     update: data,
//     create: { user_id: userId, ...data },
//   });

//   res.status(200).json({ message: "Profile saved", profile });
// });

export const upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      dob,
      address_at,
      address_po,
      address_market,
      address_dist,
      address_pin,
    } = req.body || {};

    // Prepare data object
    const data = {
      dob: dob ? new Date(dob) : null,
      address_at: address_at || null,
      address_po: address_po || null,
      address_market: address_market || null,
      address_dist: address_dist || null,
      address_pin: address_pin || null,
    };

    // If image uploaded
    if (req.file) {
      const filePath = req.file.path;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "user_profiles",
        public_id: `user_${userId}_${Date.now()}`,
        overwrite: true,
      });

      // Save image URL
      data.avatar = result.secure_url;

      // Delete temp file
      fs.unlinkSync(filePath);
    }

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { user_id: userId },
      update: data,
      create: {
        user_id: userId,
        ...data,
      },
    });

    res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const refreshToken = trycatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  // console.log(refreshToken, "this is rfestkn")
  if (!refreshToken) {
    return res.status(401).json({ message: " Valid refresh token required" });
  }
  const decode = await verifyRefreshToken(refreshToken);
  // console.log(decode, "this is decoded token")
  if (!decode) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }

  generateAccessToken(decode.id, res);
  const { generateCSRFToken } = await import("../config/csrfMiddleware.js");
  await generateCSRFToken(decode.id, res);
  res.status(200).json({ message: "Access token refreshed" });
});

export const logoutUser = trycatch(async (req, res) => {
  const userId = req.user.id;
  await revokeRefreshToken(userId);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");

  await redisClient.del(`user:${userId}`);
  res.status(200).json({ message: "Logged out successfully3" });
});

export const getUserProfile = trycatch(async (req, res) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
});

export const refreshCSRF = trycatch(async (req, res) => {
  const userId = req.user.id;

  const newCSRFToken = await generateCSRFToken(userId, res);
  res.status(200).json({
    message: "CSRF token refreshed",
    csrfToken: newCSRFToken,
  });
});

export const adminController = trycatch(async (req, res) => {
  res.json({
    message: "hello Admin Rajesh",
  });
});

export const getAllVendors = trycatch(async (req, res) => {
  const cacheKey = "all_vendors";

  // Try to get from cache first
  const cachedVendors = await redisClient.get(cacheKey);
  if (cachedVendors) {
    const vendorsData = JSON.parse(cachedVendors);
    return res.status(200).json({
      message: "Vendors fetched from cache",
      vendors: vendorsData, 
    });
  }

  // If not in cache, fetch from database
  const vendors = await prisma.user.findMany({
    where: { role: "VENDOR" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      // points: true,
      created_at: true,
      vendorProfile: {
        select: {
          store_name: true,
          address_at: true,
          address_po: true,
          address_market: true,
          address_dist: true,
          address_pin: true,
        },
      },
      _count: {
        select: {
          offers: true,
          ratingsReceived: true,
        },
      },
    },
  });

  const vendorIds = vendors.map((vendor) => vendor.id);
  const ratingSummaries = await prisma.rating.groupBy({
    by: ["vendor_id"],
    where: { vendor_id: { in: vendorIds } },
    _avg: {
      stars: true,
    },
  });
  const ratingMap = ratingSummaries.reduce((map, summary) => {
    map[summary.vendor_id] = {
      average_rating: summary._avg?.stars || 0,
    };
    return map;
  }, {});

  const vendorsWithOfferCount = vendors.map((vendor) => ({
    ...vendor,
    offer_count: vendor._count?.offers ?? 0,
    rating_count: vendor._count?.ratingsReceived ?? 0,
    average_rating: ratingMap[vendor.id]?.average_rating ?? 0,
  }));

  // Save to cache for future requests (e.g., 10 minutes)
  await redisClient.set(cacheKey, JSON.stringify(vendorsWithOfferCount), {
    EX: 600,
  });

  res.status(200).json({
    message: "Vendors fetched successfully",
    vendors: vendorsWithOfferCount,
  });
});

export const getVendorById = trycatch(async (req, res) => {
  const { id } = req.params;
  const vendor = await prisma.user.findUnique({
    where: { id, role: "VENDOR" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      created_at: true,
      vendorProfile: {
        select: {
          store_name: true,
          deals_with: true,
          category: true,
          address_at: true,
          address_po: true,
          address_market: true,
          address_dist: true,
          address_pin: true,
        },
      },
    },
  });
  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }
  res.status(200).json({
    message: "Vendor fetched successfully",
    vendor,
  });
});

export const getAllCustomers = trycatch(async (req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      points: true,
      created_at: true,
    },
  });
  res.status(200).json({
    message: "Customers fetched successfully",
    customers,
  });
});

export const updateProfile = trycatch(async (req, res) => {
  const userId = req.user.id;
  const { name, mobile } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ message: "Name and mobile are required" });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      mobile,
    },
  });

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

export const checkReferrer = trycatch(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  const referrer = await prisma.user.findUnique({
    where: { mobile: mobile.toString() },
    select: {
      id: true,
      name: true,
      mobile: true,
    },
  });

  if (!referrer) {
    return res.status(404).json({ message: "Referrer not found" });
  }

  res.status(200).json({
    message: "Referrer found",
    userId: referrer.id,
    name: referrer.name,
    mobile: referrer.mobile,
  });
});

export const forgotPassword = trycatch(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res
      .status(200)
      .json({ message: "If your email is registered, an OTP has been sent." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `forgot:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 }); // 5 minutes

  await sendMail({
    email,
    subject: "Password Reset OTP",
    html: getOtpHtml({ otp }),
  });

  res
    .status(200)
    .json({ message: "OTP sent to your email. Valid for 5 minutes." });
});

export const resetPassword = trycatch(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  const otpKey = `forgot:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  await redisClient.del(otpKey);

  res.status(200).json({ message: "Password reset successfully" });
});
