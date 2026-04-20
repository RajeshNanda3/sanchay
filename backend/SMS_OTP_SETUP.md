# SMS OTP Registration Setup Guide

## Overview

The registration system has been updated to send OTP via SMS instead of email verification links. This guide explains how to set up and use the new SMS OTP functionality.

## Flow

1. **Register** → User sends email, name, password, and mobile
2. **OTP Generation** → System generates 6-digit OTP and sends via SMS
3. **OTP Verification** → User submits OTP to complete registration
4. **Account Created** → User account is created upon successful verification

---

## SMS Service Options (Pick One)

### Option 1: 2Factor.in (Recommended - Completely Free)

**Best for:** Free tier users, no credit card required

- **Sign up:** https://2factor.in
- **Features:**
  - First 100 OTPs completely free
  - No credit card needed
  - Quick setup
  - India-focused

**Setup:**

```env
OTP_PROVIDER=2factor
OTP_API_KEY=your_2factor_api_key_here
```

---

### Option 2: MSG91 (Popular in India)

**Best for:** Indian users with decent free tier

- **Sign up:** https://www.msg91.com
- **Features:**
  - Free trial credits
  - Supports transactional SMS
  - Good reliability
  - Route-based delivery

**Setup:**

```env
OTP_PROVIDER=msg91
MSG91_API_KEY=your_msg91_api_key
MSG91_ROUTE=4  # 1=Promotional, 4=Transactional
```

---

### Option 3: AWS SNS (100 Free SMS/Month)

**Best for:** Users already using AWS infrastructure

- **Sign up:** https://aws.amazon.com
- **Features:**
  - 100 free SMS per month
  - Enterprise-grade reliability
  - Need AWS credentials

**Setup:**

```bash
npm install @aws-sdk/client-sns
```

```env
OTP_PROVIDER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

---

### Option 4: Twilio (Free Trial with $15.99 Credit)

**Best for:** International users, reliable service

- **Sign up:** https://www.twilio.com
- **Features:**
  - $15.99 free trial credit
  - Works globally
  - Excellent documentation
  - Verified phone number required

**Setup:**

```bash
npm install twilio
```

```env
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx  # Your Twilio number
```

---

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install axios
```

If using AWS SNS:

```bash
npm install @aws-sdk/client-sns
```

If using Twilio:

```bash
npm install twilio
```

### 2. Update .env File

Add your chosen SMS provider configuration:

```env
# SMS OTP Configuration
OTP_PROVIDER=2factor
OTP_API_KEY=your_api_key_here

# Or for MSG91
# OTP_PROVIDER=msg91
# MSG91_API_KEY=your_api_key
# MSG91_ROUTE=4

# Or for Twilio
# OTP_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

---

## API Usage

### 1. Register User (Generate OTP)

**Endpoint:** `POST /api/user/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword",
  "mobile": "919876543210",
  "role": "USER",
  "referred_by": null
}
```

**Response (Success):**

```json
{
  "message": "OTP has been sent to your mobile number 91****3210. Please verify to complete registration. OTP will expire in 15 minutes.",
  "mobile": "91****3210",
  "expiresIn": 900
}
```

**Response (Error):**

```json
{
  "message": "Failed to send OTP. Please try again later."
}
```

---

### 2. Verify OTP (Complete Registration)

**Endpoint:** `POST /api/user/register/verify-otp`

**Request Body:**

```json
{
  "mobile": "919876543210",
  "otp": "123456"
}
```

**Response (Success):**

```json
{
  "message": "User registered and verified successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "mobile": "919876543210",
    "role": "USER"
  }
}
```

**Response (Error):**

```json
{
  "message": "Invalid OTP. Please enter the correct OTP."
}
```

---

## Frontend Integration Example

```javascript
// Step 1: Register and send OTP
const registerUser = async (formData) => {
  try {
    const response = await axios.post("/api/user/register", {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      mobile: formData.mobile,
    });

    // Show OTP verification screen
    showOTPVerificationScreen(response.data.mobile);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response.data.message);
  }
};

// Step 2: Verify OTP
const verifyOTP = async (mobile, otp) => {
  try {
    const response = await axios.post("/api/user/register/verify-otp", {
      mobile,
      otp,
    });

    // Registration complete
    console.log("User registered:", response.data.user);
    return response.data;
  } catch (error) {
    console.error("OTP verification failed:", error.response.data.message);
  }
};
```

---

## Mobile Number Format

**Supported formats:**

- 919876543210 (India)
- +919876543210
- 9876543210 (your provider should handle)

**Validation:** Ensure phone numbers are validated before sending

---

## Testing in Development

If OTP_API_KEY is not set:

- System logs OTP to console in development mode
- Use logged OTP for testing
- Example console output: `[DEV MODE] OTP for 919876543210: 123456`

---

## Switching SMS Providers

To switch providers, just change the `.env` variable:

```env
# From 2Factor to MSG91
OTP_PROVIDER=msg91
MSG91_API_KEY=new_api_key
```

The code automatically uses the correct provider function.

---

## Troubleshooting

| Issue            | Solution                                               |
| ---------------- | ------------------------------------------------------ |
| OTP not received | Check mobile number format, verify SMS quota           |
| Expired OTP      | OTP expires after 15 minutes, user must register again |
| API key errors   | Verify correct credentials in .env file                |
| Rate limit hit   | Registration rate limited to 1 per 60 seconds per IP   |
| Duplicate mobile | User cannot register twice with same mobile            |

---

## Security Features

✅ Rate limiting (1 registration per minute per IP)
✅ OTP expires in 15 minutes
✅ One-time OTP use (deleted after verification)
✅ Mobile number masked in response
✅ Password hashed with bcrypt
✅ Duplicate user prevention
✅ Input sanitization

---

## Next Steps

1. Choose your SMS provider
2. Sign up and get API key
3. Update `.env` file
4. Install dependencies (`npm install axios`)
5. Test with a valid phone number
6. Deploy with proper credentials

---

## Support

For issues with specific SMS providers, refer to their documentation:

- 2Factor.in: https://2factor.in/tutorial/
- MSG91: https://www.msg91.com/api/
- AWS SNS: https://docs.aws.amazon.com/sns/
- Twilio: https://www.twilio.com/docs/sms
