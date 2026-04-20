import React from "react";
import { Link } from "react-router-dom";
import { AppData } from "../context/AppContext";

const NavBar = () => {
  const { logoutUser, user } = AppData();

  return (
    <header className="relative z-50 border-b border-white/10 bg-[#09070f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div
        className="absolute left-0 top-0 h-full w-2 opacity-90"
        style={{
          background:
            "linear-gradient(to bottom, #f5d17f, #d4b14b, transparent)",
        }}
      ></div>
      <div className="container mx-auto flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-xl font-black tracking-wide text-white"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5d17f] text-sm font-bold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/20">
            S
          </span>
          Sanchay
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-[#d9cfb8] md:justify-start">
          <Link to="/" className="transition hover:text-white">
            Home
          </Link>
          <Link to="/contact" className="transition hover:text-white">
            Contact
          </Link>
          {user && (
            <Link to="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              {/* <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f5d17f] shadow-inner shadow-black/10">
                Hi, {user.name}
              </span> */}
              <button
                onClick={logoutUser}
                className="rounded-full bg-[#f5d17f] px-5 py-2 text-sm font-semibold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/30 transition hover:bg-[#f1c85d]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-[#f5d17f] px-5 py-2 text-sm font-semibold text-[#f5d17f] transition hover:bg-[#f5d17f]/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#f5d17f] px-5 py-2 text-sm font-semibold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/30 transition hover:bg-[#f1c85d]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
