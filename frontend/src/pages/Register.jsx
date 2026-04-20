import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../main.jsx";
import { AppData } from "../context/AppContext.jsx";

const Register = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [referrerMobile, setReferrerMobile] = useState("");
  const [referredBy, setReferredBy] = useState(null);
  const [referrerError, setReferrerError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // OTP verification states
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpBtnLoading, setOtpBtnLoading] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const { setIsAuth, setUser } = AppData();

  const navigate = useNavigate();

  const checkReferrer = async (mobile) => {
    if (!mobile) {
      setReferrerError("");
      setReferredBy(null);
      return;
    }

    try {
      const { data } = await axios.post(
        `${server}/api/v1/users/check-referrer`,
        {
          mobile: mobile,
        },
      );

      if (data.userId) {
        setReferredBy(data.userId);
        setReferrerError("");
        toast.success("Referrer found!");
      } else {
        setReferrerError("Referrer not found");
        setReferredBy(null);
      }
    } catch (error) {
      setReferrerError(
        error.response?.data?.message || "Error checking referrer",
      );
      setReferredBy(null);
    }
  };

  const handleReferrerChange = async (e) => {
    const mobile = e.target.value;
    setReferrerMobile(mobile);
    await checkReferrer(mobile);
  };

  const verifyOtpHandler = async (e) => {
    setOtpBtnLoading(true);
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/api/v1/users/register/verify-otp`,
        {
          mobile: registrationData.mobile,
          email: registrationData.email,
          otp,
        },
        {
          withCredentials: true,
        },
      );

      toast.success(data.message);
      // Clear OTP and registration data
      setOtp("");
      setRegistrationData(null);
      setShowOtpVerification(false);
      setMaskedMobile("");
      setIsAuth(true);
      setUser(data.user);

      // Navigate to home page after successful registration
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed2");
    } finally {
      setOtpBtnLoading(false);
    }
  };

  const resendOtpHandler = async () => {
    if (!registrationData) return;

    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/users/register`,
        registrationData,
      );
      toast.success(data.message);
      setMaskedMobile(
        data.mobile ||
          registrationData.mobile.replace(/(\d{2})(\d{4})(\d{4})/, "$1****$3"),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setBtnLoading(false);
    }
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    try {
      const { data } = await axios.post(`${server}/api/v1/users/register`, {
        name,
        mobile,
        email,
        password,
        role,
        referred_by: referredBy,
      });

      // Store registration data for OTP verification
      setRegistrationData({
        name,
        mobile,
        email,
        password,
        role,
        referred_by: referredBy,
      });

      // Set masked mobile for display
      setMaskedMobile(
        data.mobile || mobile.replace(/(\d{2})(\d{4})(\d{4})/, "$1****$3"),
      );

      // Show OTP verification screen
      setShowOtpVerification(true);
      toast.success(data.message);

      // Clear form
      setName("");
      setMobile("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setReferrerMobile("");
      setReferredBy(null);
      setReferrerError("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <section className="min-h-screen bg-[#05030a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#0c0b16] via-[#09070f] to-[#120d19] opacity-90"></div>
      <div className="absolute bottom-16 -right-20 h-80 w-80 rounded-full bg-[#f5d17f]/10 blur-3xl"></div>
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6b5c2b]/40 bg-[#2c271a]/80 px-4 py-2 text-sm uppercase tracking-[0.2em] text-[#f5d17f] shadow-lg shadow-black/20">
              {showOtpVerification
                ? "OTP verification"
                : "Register with Sanchay"}
            </span>
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {showOtpVerification
                  ? "Almost there — verify your phone to finish registration"
                  : "Create your account and start earning loyalty points."}
              </h1>
              <p className="text-lg text-[#c8c2a1] leading-relaxed">
                {showOtpVerification
                  ? `We've sent a secure OTP to ${maskedMobile}. Enter it below to activate your vendor or customer account.`
                  : "Join the Sanchay network to issue points, manage purchases, and redeem rewards with a polished loyalty dashboard."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/15">
                <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f] mb-3">
                  Built for growth
                </p>
                <p className="text-sm text-[#d4cfa8]">
                  Connect with customers, vendors, and reward programs in one
                  seamless platform.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/15">
                <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f] mb-3">
                  Verified sign-up
                </p>
                <p className="text-sm text-[#d4cfa8]">
                  Secure account activation with mobile OTP verification for
                  safe onboarding.
                </p>
              </div>
            </div>
          </div>

          {showOtpVerification ? (
            <form
              onSubmit={verifyOtpHandler}
              className="w-full rounded-4xl border border-white/10 bg-[#0f0d18]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-8 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f]">
                  Verify OTP
                </p>
                <h2 className="mt-3 text-3xl font-black text-white">
                  Confirm your mobile
                </h2>
              </div>
              <div className="relative mb-5">
                <label
                  htmlFor="otp"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  OTP code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  maxLength="6"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[#f5d17f] px-6 py-3 text-sm font-semibold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/30 transition hover:bg-[#f1c85d] disabled:cursor-not-allowed disabled:opacity-70 mb-4"
                disabled={otpBtnLoading}
              >
                {otpBtnLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={resendOtpHandler}
                className="w-full rounded-full border border-[#f5d17f] bg-transparent px-6 py-3 text-sm font-semibold text-[#f5d17f] transition hover:bg-[#f5d17f]/10 disabled:cursor-not-allowed disabled:opacity-70 mb-4"
                disabled={btnLoading}
              >
                {btnLoading ? "Sending..." : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOtpVerification(false);
                  setOtp("");
                  setRegistrationData(null);
                  setMaskedMobile("");
                }}
                className="w-full rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-[#c8c2a1] transition hover:bg-white/10"
              >
                Back to registration
              </button>
            </form>
          ) : (
            <form
              onSubmit={submitHandler}
              className="w-full rounded-4xl border border-white/10 bg-[#0f0d18]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-8 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f]">
                  Create account
                </p>
                <h2 className="mt-3 text-3xl font-black text-white">
                  Register with Sanchay
                </h2>
              </div>
              <div className="relative mb-5">
                <label
                  htmlFor="name"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="relative mb-5">
                <label
                  htmlFor="mobile"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  Mobile
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              <div className="relative mb-5">
                <label
                  htmlFor="role"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                >
                  <option value="USER">USER</option>
                  <option value="VENDOR">VENDOR</option>
                </select>
              </div>
              <div className="relative mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative mb-5">
                <label
                  htmlFor="referrerMobile"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  Referrer Mobile (Optional)
                </label>
                <input
                  type="tel"
                  id="referrerMobile"
                  name="referrerMobile"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                  value={referrerMobile}
                  onChange={handleReferrerChange}
                  placeholder="Enter referrer's mobile number"
                />
                {referrerError && (
                  <p className="text-red-400 text-xs mt-2">{referrerError}</p>
                )}
                {referredBy && (
                  <p className="text-green-400 text-xs mt-2">
                    ✓ Referrer verified
                  </p>
                )}
              </div>
              <div className="relative mb-8">
                <label
                  htmlFor="password"
                  className="block text-sm text-[#c8c2a1] mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b0914] px-4 py-3 text-base text-white outline-none transition focus:border-[#f5d17f] focus:ring-2 focus:ring-[#f5d17f]/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="w-full rounded-full bg-[#f5d17f] px-6 py-3 text-sm font-semibold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/30 transition hover:bg-[#f1c85d] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={btnLoading}
              >
                {btnLoading ? "Loading..." : "Register"}
              </button>
              <div className="mt-6 text-center text-sm text-[#c8c2a1]">
                <Link to="/login" className="text-[#f5d17f] hover:text-white">
                  Already have an account?
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Register;
