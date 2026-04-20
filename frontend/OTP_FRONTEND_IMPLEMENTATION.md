# Frontend OTP Registration Implementation

## Overview

The registration flow has been updated to use SMS OTP verification instead of email verification links.

## Changes Made

### Updated Files

- `frontend/src/pages/Register.jsx` - Added OTP verification flow

### New Features

✅ **Two-step registration process:**

1. User fills registration form → OTP sent to mobile
2. User enters OTP → Account created

✅ **OTP Verification Screen:**

- Shows masked mobile number (91\*\*\*\*3210)
- 6-digit OTP input field
- Verify OTP button
- Resend OTP button
- Back to registration button

✅ **State Management:**

- `showOtpVerification` - Controls which form to show
- `otp` - Stores entered OTP
- `registrationData` - Stores form data for resend
- `maskedMobile` - Shows masked mobile number

---

## User Flow

### Step 1: Registration Form

```
User fills: name, email, mobile, password, role, referrer (optional)
Clicks "Register" → API call to /api/v1/users/register
```

### Step 2: OTP Sent

```
Backend sends OTP to mobile
Frontend shows: "OTP sent to 91****3210"
Switches to OTP verification screen
```

### Step 3: OTP Verification

```
User enters 6-digit OTP
Clicks "Verify OTP" → API call to /api/v1/users/register/verify-otp
On success → Navigate to login page
```

### Step 4: Resend OTP (Optional)

```
User clicks "Resend OTP" → Repeats registration API call
New OTP sent to same mobile number
```

---

## API Endpoints Used

### 1. Register & Send OTP

```
POST /api/v1/users/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "919876543210",
  "password": "password123",
  "role": "USER",
  "referred_by": null
}
```

**Response:**

```json
{
  "message": "OTP has been sent to your mobile number 91****3210...",
  "mobile": "91****3210",
  "expiresIn": 900
}
```

### 2. Verify OTP

```
POST /api/v1/users/register/verify-otp
Body: {
  "mobile": "919876543210",
  "otp": "123456"
}
```

**Response:**

```json
{
  "message": "User registered and verified successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "mobile": "919876543210",
    "role": "USER"
  }
}
```

---

## UI States

### Registration Form (Default)

- All input fields visible
- Register button enabled
- "Have an account?" link

### OTP Verification Screen

- Left panel: "Verify Your Mobile Number" + instructions
- Right panel: OTP input form
- "Verify OTP" button (primary)
- "Resend OTP" button (secondary)
- "Back to Registration" button (gray)

---

## Error Handling

### Registration Errors

- Invalid data → Show validation errors
- User exists → Show "User already exists"
- Rate limit → Show rate limit message
- SMS failed → Show "Failed to send OTP"

### OTP Verification Errors

- Invalid OTP → "Invalid OTP. Please enter the correct OTP."
- Expired OTP → "OTP expired or not found. Please register again."
- Wrong mobile → "Please check your mobile number"

---

## Mobile Number Masking

**Input:** `919876543210`
**Display:** `91****3210`

**Code:**

```javascript
mobile.replace(/(\d{2})(\d{4})(\d{4})/, "$1****$3");
```

---

## State Management

```javascript
// Form states
const [name, setName] = useState("");
const [mobile, setMobile] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [role, setRole] = useState("USER");

// OTP states
const [showOtpVerification, setShowOtpVerification] = useState(false);
const [otp, setOtp] = useState("");
const [otpBtnLoading, setOtpBtnLoading] = useState(false);
const [maskedMobile, setMaskedMobile] = useState("");
const [registrationData, setRegistrationData] = useState(null);
```

---

## Button States

| State    | Register Button | Verify Button   | Resend Button |
| -------- | --------------- | --------------- | ------------- |
| Default  | "Register"      | "Verify OTP"    | "Resend OTP"  |
| Loading  | "Loading..."    | "Verifying..."  | "Sending..."  |
| Disabled | `btnLoading`    | `otpBtnLoading` | `btnLoading`  |

---

## Navigation Flow

```
Register.jsx
├── Registration Form → API: /register
├── OTP Sent → Show OTP Screen
├── OTP Verified → Navigate: /login
├── Back Button → Show Registration Form
└── Resend OTP → API: /register (again)
```

---

## Testing Checklist

### Registration Form

- [ ] All fields required validation
- [ ] Email format validation
- [ ] Mobile number validation
- [ ] Password requirements
- [ ] Referrer validation (optional)

### OTP Verification

- [ ] OTP input accepts only 6 digits
- [ ] Verify button disabled when loading
- [ ] Success message on verification
- [ ] Error message on invalid OTP
- [ ] Navigation to login on success

### Resend OTP

- [ ] Resend button works
- [ ] New OTP sent to same number
- [ ] Success message shown

### Back Button

- [ ] Returns to registration form
- [ ] Clears OTP and registration data
- [ ] Form reset properly

---

## Mobile Responsiveness

The form uses Tailwind CSS responsive classes:

- `lg:w-2/6 md:w-1/2` - Form width
- `md:ml-auto` - Right alignment on medium screens
- `w-full` - Full width on mobile
- `mt-10 md:mt-0` - Top margin adjustments

---

## Accessibility

- Proper `label` elements for all inputs
- `htmlFor` attributes linking labels to inputs
- Focus states with `focus:border-indigo-500`
- Button disabled states properly handled
- Semantic HTML with `form`, `section`, `h1`, `h2`

---

## Next Steps

1. ✅ Update Register.jsx with OTP flow
2. ⏳ Test with backend API
3. ⏳ Update any other components that reference old flow
4. ⏳ Add loading states and better UX
5. ⏳ Add OTP countdown timer (optional)

---

## Code Quality

- ✅ Proper error handling with try/catch
- ✅ Loading states for all async operations
- ✅ Form validation and sanitization
- ✅ Clean state management
- ✅ Responsive design
- ✅ Accessibility considerations
- ✅ Toast notifications for user feedback
