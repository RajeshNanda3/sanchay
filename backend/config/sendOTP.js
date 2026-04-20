import axios from "axios";

/**
 * Send OTP via SMS using a free service
 * Options:
 * 1. 2Factor.in - Completely free (first 100 OTPs)
 * 2. MSG91 - Popular in India, has free tier
 * 3. AWS SNS - 100 free SMS per month
 * 4. Twilio - Free trial with credits
 */

// Using 2Factor.in (Completely Free - no credit card required)
// Sign up at: https://2factor.in and get your API key
export const sendOTP = async (mobile, otp) => {
  try {
    const apiKey = process.env.OTP_API_KEY; // 2Factor.in API key

    if (!apiKey) {
      console.warn(
        "OTP_API_KEY not configured. Please set it in your .env file",
      );
      console.log(`[DEV MODE] OTP for ${mobile}: ${otp}`);
      return true;
    }

    // Using 2Factor.in API with SMS-ONLY (no AUTOGEN which allows voice fallback)
    // Adding country code if not present (default to India +91)
    const phoneNumber = mobile.startsWith("+")
      ? mobile
      : mobile.startsWith("91")
        ? mobile
        : `91${mobile}`;

    const response = await axios.post(
      `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/${otp}`,
    );

    if (response.data.Status === "Success") {
      console.log(`✅ OTP sent successfully to ${mobile} via 2Factor.in SMS`);
      return true;
    } else {
      console.error("❌ Failed to send OTP via 2Factor.in:", response.data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending OTP via 2Factor.in:", error.message);
    console.log(
      "💡 If still getting voice calls, switch to Twilio: OTP_PROVIDER=twilio",
    );
    return false;
  }
};

/**
 * Alternative: Using MSG91 (Popular in India)
 * Set OTP_PROVIDER=msg91 in .env and configure MSG91_API_KEY
 * SMS-only configuration using sendotp.php
 */
export const sendOTPWithMSG91 = async (mobile, otp) => {
  try {
    const apiKey = process.env.MSG91_API_KEY;

    if (!apiKey) {
      console.warn(
        "MSG91_API_KEY not configured. Please set it in your .env file",
      );
      console.log(`[DEV MODE] OTP for ${mobile}: ${otp}`);
      return true;
    }

    const response = await axios.get("https://api.msg91.com/api/sendotp.php", {
      params: {
        route: "4", // OTP route for SMS
        mobiles: mobile,
        authkey: apiKey,
        otp: otp,
        country: process.env.MSG91_COUNTRY || "91",
      },
    });

    if (response.data.type === "success") {
      console.log(`OTP sent successfully to ${mobile} via MSG91 SMS`);
      return true;
    }

    console.error("Failed to send OTP with MSG91:", response.data);
    return false;
  } catch (error) {
    console.error("Error sending OTP with MSG91:", error.message);
    return false;
  }
};

/**
 * Alternative: Using AWS SNS (100 free SMS per month)
 * Requires AWS credentials configuration
 */
export const sendOTPWithAWS = async (mobile, otp) => {
  try {
    const { SNSClient, PublishCommand } = await import("@aws-sdk/client-sns");

    const snsClient = new SNSClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    const params = {
      Message: `Your OTP is: ${otp}. It will expire in 15 minutes.`,
      PhoneNumber: mobile.startsWith("+") ? mobile : `+${mobile}`,
    };

    const command = new PublishCommand(params);
    await snsClient.send(command);

    console.log(`OTP sent successfully to ${mobile} via AWS SNS SMS`);
    return true;
  } catch (error) {
    console.error("Error sending OTP with AWS SNS:", error.message);
    return false;
  }
};

/**
 * Alternative: Using Twilio (Free trial with $15.99 credit)
 * Sign up at: https://www.twilio.com
 */
export const sendOTPWithTwilio = async (mobile, otp) => {
  try {
    const twilio = await import("twilio");
    const twilioClient = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}. It will expire in 15 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile.startsWith("+") ? mobile : `+${mobile}`,
    });

    console.log(`OTP sent successfully to ${mobile} via Twilio SMS`);
    return true;
  } catch (error) {
    console.error("Error sending OTP with Twilio:", error.message);
    return false;
  }
};
/**
 * Get appropriate OTP sender based on configuration
 */
export const getOTPProvider = () => {
  const provider = process.env.OTP_PROVIDER || "2factor"; // Default to 2factor
  console.log(`Using OTP provider: ${provider}`);

  switch (provider.toLowerCase()) {
    case "msg91":
      return sendOTPWithMSG91;
    case "aws":
      return sendOTPWithAWS;
    case "twilio":
      return sendOTPWithTwilio;
    case "2factor":
    default:
      return sendOTP;
  }
};

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
