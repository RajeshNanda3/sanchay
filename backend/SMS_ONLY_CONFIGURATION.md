# SMS-ONLY OTP Configuration Guide

## Problem: OTP Coming via Voice Call Instead of SMS

If you're receiving OTP via voice call (IVR) instead of text message, it's because your SMS provider is configured to fallback to voice delivery when SMS delivery fails or when a voice-enabled route is set.

---

## Solution by Provider

### ✅ **Option 1: 2Factor.in (RECOMMENDED - SMS-ONLY by Default)**

**Why it's best:** Uses SMS-only endpoint by default, no voice fallback possible.

**Setup:**

```env
OTP_PROVIDER=2factor
OTP_API_KEY=your_2factor_api_key_here
```

**Key Feature:** The endpoint `/SMS/` explicitly sends SMS only - no voice fallback.

**Status:** ✅ Already SMS-only, no additional configuration needed

---

### ✅ **Option 2: MSG91 (Updated - SMS-ONLY Configuration)**

**The Issue:** MSG91 routes can fallback to voice. We've updated the code to use SMS-only method.

**Previous Configuration (❌ WRONG - causes voice fallback):**

```env
OTP_PROVIDER=msg91
MSG91_API_KEY=your_api_key
MSG91_ROUTE=4  # This can fallback to voice!
```

**Updated Configuration (✅ CORRECT - SMS-ONLY):**

```env
OTP_PROVIDER=msg91
MSG91_API_KEY=your_msg91_api_key
MSG91_DLT_TE_ID=  # Leave empty if your region doesn't require DLT
MSG91_TEMPLATE_ID=  # Leave empty if your region doesn't require DLT
```

**Key Changes:**

- ✅ Now uses `route: "otp"` (SMS-specific route)
- ✅ Uses `method: "sendotp"` (SMS delivery only)
- ✅ Removed variable route parameter that allowed voice
- ✅ No fallback to voice delivery

**For India Users (DLT Required):**
If you're in India and getting "SMS to unregistered number" errors, you need DLT:

1. **Get DLT TE ID:**
   - Go to https://mg.msg91.com (MSG91 Dashboard)
   - Register as Entity (Business)
   - Get your TE ID (6-digit number starting with 0)

2. **Create DLT Template:**
   - Add a new template: "Your OTP is {{otp}}. It will expire in 15 minutes."
   - Template will be approved within 1-2 hours
   - Get the Template ID

3. **Update .env:**
   ```env
   OTP_PROVIDER=msg91
   MSG91_API_KEY=your_api_key
   MSG91_DLT_TE_ID=123456  # Your 6-digit TE ID
   MSG91_TEMPLATE_ID=1234567890  # 10-digit template ID
   ```

---

### ✅ **Option 3: AWS SNS (SMS-ONLY by Default)**

**Why it's good:** AWS SNS is SMS-only, no voice fallback.

**Setup:**

```env
OTP_PROVIDER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

**Status:** ✅ Already SMS-only

---

### ✅ **Option 4: Twilio (SMS-ONLY by Default)**

**Why it's good:** Explicitly sends SMS messages, no voice unless configured.

**Setup:**

```env
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

**Status:** ✅ Already SMS-only

---

## Quick Fix Steps

### **If You're Using MSG91:**

1. **Update .env file** (remove old MSG91_ROUTE):

   ```env
   OTP_PROVIDER=msg91
   MSG91_API_KEY=your_api_key
   # Remove: MSG91_ROUTE=4
   # Add if required in your region:
   MSG91_DLT_TE_ID=
   MSG91_TEMPLATE_ID=
   ```

2. **Verify the code is updated:**
   - Check `backend/config/sendOTP.js`
   - Should use `route: "otp"` and `method: "sendotp"`

3. **Restart your backend:**

   ```bash
   npm run dev
   ```

4. **Test registration** with a test mobile number

---

## Provider Comparison for SMS-ONLY Delivery

| Provider   | SMS-Only         | Voice Fallback   | Cost            | Region |
| ---------- | ---------------- | ---------------- | --------------- | ------ |
| 2Factor.in | ✅ Yes           | ❌ No            | Free (100 OTPs) | Global |
| MSG91      | ✅ Yes (updated) | ❌ No (with fix) | Trial credits   | India+ |
| AWS SNS    | ✅ Yes           | ❌ No            | 100/month free  | Global |
| Twilio     | ✅ Yes           | ❌ No            | $15.99 trial    | Global |

---

## How Voice Fallback Happens

```
User registers
    ↓
SMS sent to provider
    ↓
   [If Old Config - WRONG]
   Route allows voice fallback
   SMS delivery fails
    ↓
   Fallback to voice call (IVR) ❌

   [With SMS-ONLY Config - CORRECT]
   SMS-only route enforced
   No voice fallback possible
    ↓
   SMS delivered ✅
```

---

## Verification Checklist

After applying the fix:

- [ ] Updated `.env` file with new MSG91 settings (if using MSG91)
- [ ] Removed old `MSG91_ROUTE` parameter
- [ ] Restarted backend server (`npm run dev`)
- [ ] Tested registration with valid mobile number
- [ ] OTP received via SMS (not voice call)
- [ ] OTP verification works
- [ ] Account creation successful

---

## Troubleshooting

### Still Getting Voice Calls?

1. **Clear old configuration:**

   ```bash
   # Check your .env file
   grep -i "msg91_route" .env  # Should return nothing
   grep -i "otp_provider" .env  # Should show: msg91 or 2factor
   ```

2. **Restart backend:**

   ```bash
   # Kill existing process
   Ctrl+C

   # Start fresh
   npm run dev
   ```

3. **Check logs:**

   ```
   Look for: "OTP sent successfully to XXXXXXX via SMS"
   ```

4. **Switch providers temporarily:**
   ```env
   # Try 2Factor.in (guaranteed SMS-only)
   OTP_PROVIDER=2factor
   OTP_API_KEY=your_key
   ```

### SMS Delivery Failed (India Users)

**Error:** "SMS to unregistered number"

**Solution:** Register with DLT

1. Go to MSG91 dashboard
2. Register as Entity
3. Create and approve template
4. Add TE ID and Template ID to .env

---

## Code Changes Made

### Updated sendOTP.js:

- ✅ Changed `route` from variable to hardcoded `"otp"`
- ✅ Changed `method` to `"sendotp"` (SMS-specific)
- ✅ Added DLT support (TE ID and Template ID)
- ✅ Removed voice-fallback capable routes
- ✅ Added detailed logging for SMS-only delivery

### Updated .env.example:

- ✅ Removed `MSG91_ROUTE` parameter
- ✅ Added `MSG91_DLT_TE_ID` (optional)
- ✅ Added `MSG91_TEMPLATE_ID` (optional)
- ✅ Added SMS-ONLY labels to all providers
- ✅ Added helpful comments

---

## Best Practices

1. **Test thoroughly** - Register multiple times to verify SMS only
2. **Monitor logs** - Check server logs for OTP delivery status
3. **Use DLT (India)** - Required for production in India
4. **Have backup provider** - Keep 2Factor.in configured as fallback
5. **Monitor delivery rate** - Track successful SMS deliveries

---

## Additional Resources

- **2Factor.in:** https://2factor.in/api/
- **MSG91 (SMS-ONLY):** https://api.msg91.com/
- **MSG91 DLT:** https://mg.msg91.com/dlt
- **AWS SNS:** https://docs.aws.amazon.com/sns/
- **Twilio:** https://www.twilio.com/docs/sms

---

## Summary

**The fix is simple:**

1. Update `.env` with SMS-only configuration
2. Restart backend
3. OTP will now come via SMS only ✅

If still getting voice calls, switch to **2Factor.in** which has guaranteed SMS-only delivery with no configuration needed.
