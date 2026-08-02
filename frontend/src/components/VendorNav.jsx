import React, { useState } from "react";
import { AppData } from "../context/AppContext";
import { Link, NavLink } from "react-router-dom";

const VendorNav = () => {
  const { user, isAuth, logout } = AppData();
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = () => {
    if (logout) logout();
  };

  const handleNavSelect = () => setOpenMenu(false);

  const desktopLinkClass = ({ isActive }) =>
    `px-2 py-1 rounded-full text-sm font-medium transition ${
      isActive
        ? "bg-[#f5d17f]/15 text-white shadow-sm"
        : "text-[#c6f135] hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition ${
      isActive
        ? "bg-[#f5d17f]/15 text-white shadow-sm"
        : "text-[#d9cfb8] hover:bg-[#f5d17f]/10 hover:text-white"
    }`;

  return (
    <nav className="relative border-b border-white/10 bg-[#09070f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div
        className="absolute left-0 top-0 h-full w-2 opacity-90"
        style={{
          background:
            "linear-gradient(to bottom, #f5d17f, #d4b14b, transparent)",
        }}
      ></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          {/* logo */}
          <div className="flex items-center gap-3 text-xl font-black tracking-wide text-white">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5d17f] text-sm font-bold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/20">
                {user && user.vendorProfile && user.vendorProfile.avatar ? (
                  <img
                    src={user.vendorProfile.avatar}
                    alt="Vendor Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg">V</span>
                )}
              </span>
              {user && user.vendorProfile && user.vendorProfile.store_name ? (
                <span>{user.vendorProfile.store_name}</span>
              ) : (
                <span>Vendor Portal</span>
              )}
            </Link>
          </div>

          {/* desktop links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#c6f135]">
            <NavLink to="/" className={desktopLinkClass}>
              Home
            </NavLink>
            {isAuth && (
              <>
                <NavLink to="/issue" className={desktopLinkClass}>
                  Issue Points
                </NavLink>
                <NavLink to="/purchase" className={desktopLinkClass}>
                  Purchase
                </NavLink>
                <NavLink to="/vendor-transactions" className={desktopLinkClass}>
                  Transactions
                </NavLink>
                <NavLink to="/vendor-offers" className={desktopLinkClass}>
                  Offers
                </NavLink>
                <NavLink to="/vendor-qr-codes" className={desktopLinkClass}>
                  QR Codes
                </NavLink>
                <NavLink to="/vendor-offer-claims" className={desktopLinkClass}>
                  Claims
                </NavLink>
                <NavLink to="/vendor-qr-requests" className={desktopLinkClass}>
                  Requests
                </NavLink>
                <NavLink to="/vendor-profile" className={desktopLinkClass}>
                  Profile
                </NavLink>
              </>
            )}
          </div>

          {/* right side user info */}
          <div className="flex flex-wrap items-center justify-end gap-4">
            {isAuth && user ? (
              <>
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="font-medium text-white">
                    Hi, {user.name}
                  </span>
                  <span className="text-sm text-[#d9cfb8]">
                    Points:{" "}
                    <span className="font-semibold text-[#c6f135]">
                      {user.points}
                    </span>
                  </span>
                </div>
                {/* <button
                  onClick={handleLogout}
                  className="rounded-full bg-[#f5d17f] px-4 py-2 text-sm font-semibold text-[#1f1b0f] shadow-lg shadow-[#f5d17f]/30 transition hover:bg-[#f1c85d]"
                >
                  Logout
                </button> */}
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-[#f5d17f] px-4 py-2 text-sm font-semibold text-[#f5d17f] transition hover:bg-[#f5d17f]/10"
              >
                Login
              </Link>
            )}

            {/* mobile toggle */}
            <button
              className="md:hidden inline-flex justify-center items-center p-2 rounded-md text-[#d9cfb8] hover:text-white focus:outline-none"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {openMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {openMenu && (
        <div className="md:hidden bg-[#09070f] shadow-inner px-2 pt-2 pb-3 space-y-1">
          <NavLink to="/" className={mobileLinkClass} onClick={handleNavSelect}>
            Home
          </NavLink>
          {isAuth && (
            <>
              <NavLink
                to="/issue"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Issue Points
              </NavLink>
              <NavLink
                to="/purchase"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Purchase
              </NavLink>
              <NavLink
                to="/vendor-transactions"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Transactions
              </NavLink>
              <NavLink
                to="/vendor-offers"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Offers
              </NavLink>
              <NavLink
                to="/vendor-qr-codes"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                QR Codes
              </NavLink>
              <NavLink
                to="/vendor-offer-claims"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Claims
              </NavLink>
              <NavLink
                to="/vendor-qr-requests"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Requests
              </NavLink>
              <NavLink
                to="/vendor-profile"
                className={mobileLinkClass}
                onClick={handleNavSelect}
              >
                Profile
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default VendorNav;
