import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../main.jsx";
import api from "../apiInterceptor.js";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [btnLoading, setBtnLoading] = React.useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    try {
      const { data } = await api.post("/api/v1/users/login", {
        email,
        password,
      });
      toast.success(data.message);
      localStorage.setItem("email", email);
      navigate("/verify-otp");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <section className="min-h-screen bg-[#05030a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#0c0b16] via-[#09070f] to-[#120d19] opacity-90"></div>
      <div className="absolute top-16 -left-20 h-80 w-80 rounded-full bg-[#f5d17f]/10 blur-3xl"></div>
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6b5c2b]/40 bg-[#2c271a]/80 px-4 py-2 text-sm uppercase tracking-[0.2em] text-[#f5d17f] shadow-lg shadow-black/20">
              Secure vendor login
            </span>
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                Login to manage your loyalty offers and vendor dashboard.
              </h1>
              <p className="text-lg text-[#c8c2a1] leading-relaxed">
                Fast access for vendors with strong security, OTP verification,
                and a polished loyalty management experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/15">
                <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f] mb-3">
                  Instant access
                </p>
                <p className="text-sm text-[#d4cfa8]">
                  Sign in quickly and reach your sanchay tools in one click.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/15">
                <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f] mb-3">
                  Safe & verified
                </p>
                <p className="text-sm text-[#d4cfa8]">
                  Secure authentication with OTP verification for every login
                  flow.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={submitHandler}
            className="w-full rounded-4xl border border-white/10 bg-[#0f0d18]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f]">
                Vendor login
              </p>
              <h2 className="mt-3 text-3xl font-black text-white">
                Sign in to continue
              </h2>
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
            <div className="relative mb-6">
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
              {btnLoading ? "Loading..." : "Login"}
            </button>
            <div className="mt-6 flex flex-col gap-3 text-center text-sm text-[#c8c2a1]">
              <Link to="/register" className="text-[#f5d17f] hover:text-white">
                Create a new account
              </Link>
              <Link
                to="/forgot-password"
                className="text-[#c8c2a1] hover:text-white"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
