import React from "react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#06040c] text-[#d9cfb8]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(245,209,127,0.18), transparent 35%)",
        }}
      ></div>
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[#f5d17f]/15 blur-3xl"></div>
      <div className="relative container mx-auto px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Sanchay Loyalty</h2>
            <p className="mt-3 max-w-xl text-sm text-[#b8b29b]">
              A premium rewards network for customers and vendors. Earn points,
              transfer value, and redeem rewards with ease.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right text-sm text-[#b8b29b] md:text-right">
            <p>
              &copy; {new Date().getFullYear()} Sanchay. All rights reserved.
            </p>
            <p>Made with ❤️ by the Sanchay Team</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
