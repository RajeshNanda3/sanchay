import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../main.jsx";
import { AppData } from "../context/AppContext";

const VerifyOtp = () => {
  const [otp, setOtp] = React.useState("");
  const [btnLoading, setBtnLoading] = React.useState(false);
  const navigate = useNavigate();
  const { setIsAuth, setUser } = AppData();
  const email = localStorage.getItem("email");

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/api/v1/users/verify-otp`,
        {
          email,
          otp,
        },
        {
          withCredentials: true,
        },
      );
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      console.log("render 1st msg")
      localStorage.clear("email");
      console.log("render 2nd msg")
      navigate("/dashboard");
      console.log("render 3rd msg")
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed-admin");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data } = await axios.post(`${server}/api/v1/users/login`, {
        email,
      });
      toast.success("OTP resent to your email");
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
          <p className="text-gray-600 mt-2">Enter the OTP sent to your email</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              One-Time Password
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-center text-lg tracking-widest"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {btnLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Didn't receive the OTP?{" "}
            <button
              onClick={handleResendOtp}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
