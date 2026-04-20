# SMS OTP Registration - Implementation Summary

## What Changed

### 1. **New Files Created**

- `config/sendOTP.js` - SMS OTP sending logic with 4 provider options
- `SMS_OTP_SETUP.md` - Complete setup guide
- `.env.example` - Environment variables template

### 2. **Modified Files**

- `controllers/userController.js` - Updated `registerUser()` and added `verifyOTPRegister()`
- `routes/userRoute.js` - Added new route `/register/verify-otp`
- `package.json` - Added `axios` dependency

---

## Quick Start (5 Steps)

### Step 1: Install Axios

```bash
cd backend
npm install axios
```

### Step 2: Choose SMS Provider & Get API Key

| Provider       | Sign Up                | Free Tier     | Setup Time |
| -------------- | ---------------------- | ------------- | ---------- |
| **2Factor.in** | https://2factor.in     | 100 free OTPs | 5 min ✨   |
| MSG91          | https://msg91.com      | Trial credits | 10 min     |
| AWS SNS        | https://aws.amazon.com | 100/month     | 15 min     |
| Twilio         | https://twilio.com     | $15.99 credit | 10 min     |

**Recommended for beginners:** 2Factor.in (no credit card needed!)

### Step 3: Update `.env` File

```env
OTP_PROVIDER=2factor
OTP_API_KEY=your_api_key_from_provider
```

### Step 4: Restart Server

```bash
npm run dev
```

### Step 5: Test Registration Flow

**1. Send Registration Request:**

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "Password123!",
    "mobile": "919876543210"
  }'
```

**Response:**

```json
{
  "message": "OTP has been sent to your mobile number 91****3210...",
  "mobile": "91****3210",
  "expiresIn": 900
}
```

**2. Verify OTP:**

```bash
curl -X POST http://localhost:5000/api/user/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "919876543210",
    "otp": "123456"
  }'
```

---

## API Endpoints

### Register (Generate OTP)

```
POST /api/user/register
Body: {
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password",
  "mobile": "919876543210"
}
```

### Verify OTP (Complete Registration)

```
POST /api/user/register/verify-otp
Body: {
  "mobile": "919876543210",
  "otp": "123456"
}
```

---

## Key Features

✅ **6-digit OTP** sent directly to mobile  
✅ **15-minute expiration** for security  
✅ **Rate limiting** (1 registration per minute per IP)  
✅ **Masked mobile numbers** in responses (91\***\*3210)  
✅ **4 SMS providers** to choose from  
✅ **Development mode** - logs OTP to console if key is missing  
✅ **Automatic provider switching\*\* - change provider by updating .env

---

## Provider Comparison

### 2Factor.in ⭐ RECOMMENDED

- ✅ No credit card required
- ✅ First 100 OTPs free
- ✅ Instant setup
- ✅ Perfect for testing
- ❌ Limited to 100 free OTPs
- **When to use:** Development & testing, small projects

### MSG91

- ✅ Popular in India
- ✅ Good pricing
- ✅ Reliable delivery
- ✅ Transactional SMS support
- ❌ Requires credit card for free trial
- **When to use:** India-focused production

### AWS SNS

- ✅ 100 free SMS/month
- ✅ Enterprise-grade
- ✅ Auto-scaling
- ❌ Requires AWS account setup
- ❌ More complex configuration
- **When to use:** Large-scale apps, AWS infrastructure

### Twilio

- ✅ Works globally
- ✅ $15.99 free trial
- ✅ Excellent support
- ❌ Requires verified phone number
- ❌ Not free after trial
- **When to use:** Global users, production apps

---

## Testing Without Real SMS

If you don't have an API key yet, the system works in **development mode**:

- OTP will be logged to console instead of sending SMS
- Example: `[DEV MODE] OTP for 919876543210: 123456`
- Use this OTP for testing

---

## Troubleshooting

### OTP Not Received

- ✅ Check mobile number format (include country code)
- ✅ Verify SMS quota not exceeded
- ✅ Check API key is correct

### "Failed to send OTP"

- ✅ API key is missing or incorrect
- ✅ Mobile number format is invalid
- ✅ SMS service is down

### OTP Expired

- ⏰ OTP expires after 15 minutes
- 🔄 User must register again

### Development Mode Not Working

- ✅ Check if OTP_API_KEY is set
- ✅ Check console logs for [DEV MODE] message

---

## Environment Variables Reference

```bash
# Required
OTP_PROVIDER=2factor              # or msg91, aws, twilio
OTP_API_KEY=your_key             # For 2factor.in

# Or for MSG91
MSG91_API_KEY=key
MSG91_ROUTE=4
```

---

## Security Highlights

| Feature            | Implementation                       |
| ------------------ | ------------------------------------ |
| OTP Expiry         | 15 minutes                           |
| OTP Usage          | One-time only (deleted after use)    |
| Rate Limiting      | 1 registration per 60 seconds per IP |
| Password           | Hashed with bcrypt                   |
| Mobile Masking     | Shown as 91\*\*\*\*3210 in responses |
| Input Validation   | Zod schema validation                |
| Input Sanitization | mongo-sanitize                       |

---

## Next Steps After Setup

1. ✅ Install axios dependency
2. ✅ Choose SMS provider
3. ✅ Get API key
4. ✅ Update .env file
5. ✅ Test the flow
6. ✅ Update frontend to use new endpoints
7. ✅ Deploy to production

---

## Support

- 📖 See `SMS_OTP_SETUP.md` for detailed guide
- 🔧 Check `.env.example` for configuration
- 📝 Review `config/sendOTP.js` for provider implementation
- 💬 Visit provider documentation for issues

---

## Quick Migration from Email to SMS

**Old Flow (Email):**

1. Register → Email sent
2. Click link in email
3. Account created

**New Flow (SMS):**

1. Register → OTP sent
2. Enter OTP
3. Account created

**Frontend changes needed:**

- Remove email verification screen
- Add OTP input screen
- Call `/register/verify-otp` instead of `/verify/:token`
