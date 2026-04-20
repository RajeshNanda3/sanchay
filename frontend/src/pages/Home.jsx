import React from "react";
import { Link } from "react-router-dom";
import { AppData } from "../context/AppContext";

const Home = () => {
  const { user, isAuth } = AppData();

  return (
    <div className="min-h-screen bg-[#05030a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0b16] via-[#09070f] to-[#120d19] opacity-95"></div>
        <div className="absolute top-12 left-[-80px] w-96 h-96 rounded-full bg-[#b68d20]/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#f8c24a]/10 blur-3xl"></div>

        <div className="relative container mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#6b5c2b]/40 bg-[#2c271a]/80 px-4 py-2 text-sm uppercase tracking-[0.2em] text-[#f5d17f] shadow-lg shadow-black/20 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#f5d17f]"></span>
            India&apos;s Smartest Loyalty Network
          </span>

          <h1 className="text-4xl md:text-6xl font-black leading-tight text-white max-w-4xl mx-auto">
            Turn every purchase into{" "}
            <span className="text-[#c6f135]">pure gold</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#c6f135] max-w-3xl mx-auto">
            Sanchay is a next-generation loyalty platform connecting customers
            and vendors across India — earn points, transfer them, redeem for
            real savings.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!isAuth ? (
              <>
                <Link
                  to="/register"
                  className="rounded-full bg-[#f5d17f] px-8 py-4 text-sm font-semibold text-[#1f1b0f] shadow-xl shadow-[#f5d17f]/30 transition hover:scale-[1.02]"
                >
                  Start earning free
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-[#f5d17f] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#f5d17f]/10"
                >
                  Explore dashboard
                </Link>
              </>
            ) : (
              <Link
                to={
                  user?.role === "ADMIN"
                    ? "/dashboard"
                    : user?.role === "USER"
                      ? "/customer-hero"
                      : "/vendor-hero"
                }
                className="rounded-full bg-[#f5d17f] px-8 py-4 text-sm font-semibold text-[#1f1b0f] shadow-xl shadow-[#f5d17f]/30 transition hover:scale-[1.02]"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="container mx-auto px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f5d17f]">
              Your Balance
            </p>
            <p className="mt-4 text-5xl font-black text-white">2,850</p>
            <p className="mt-2 text-sm text-[#b8b29b]">
              loyalty points · ≈ ₹285 value
            </p>
            <div className="mt-6 h-2 rounded-full bg-white/10">
              <div className="h-2 w-3/4 rounded-full bg-[#f5d17f]"></div>
            </div>
            <p className="mt-3 text-sm text-[#b8b29b]">
              Silver tier · Gold at 5,000
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f5d17f]">
              Network Vendors
            </p>
            <p className="mt-4 text-4xl font-black text-white">48 partners</p>
            <p className="mt-2 text-sm text-[#b8b29b]">active in your city</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#142127] px-4 py-2 text-sm text-[#72d6ff]">
              <span>↑</span> 12 this month
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f5d17f]">
              Recent activity
            </p>
            <div className="mt-6 space-y-4 text-sm text-[#b8b29b]">
              <div className="rounded-2xl bg-[#11101a] p-4">
                <p className="font-semibold text-white">Reliance Fresh</p>
                <p className="mt-2 text-[#72d6ff]">+250</p>
              </div>
              <div className="rounded-2xl bg-[#11101a] p-4">
                <p className="font-semibold text-white">
                  Redeemed · Big Bazaar
                </p>
                <p className="mt-2 text-[#ff5f7a]">-500</p>
              </div>
              <div className="rounded-2xl bg-[#11101a] p-4">
                <p className="font-semibold text-white">D-Mart Express</p>
                <p className="mt-2 text-[#72d6ff]">+180</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* How It Works Section */}
      <section className="bg-[#09070f] py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                title: "Register",
                description: "Create your account as a customer or vendor.",
              },
              {
                title: "Earn Points",
                description: "Make purchases and accumulate points.",
              },
              {
                title: "Transfer",
                description: "Share points with others securely.",
              },
              { title: "Redeem", description: "Enjoy rewards and savings." },
            ].map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl shadow-black/20"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5d17f]/15 text-xl font-bold text-[#f5d17f]">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#b8b29b]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex flex-col items-center justify-center gap-6 rounded-[3rem] border border-[#f5d17f]/20 bg-[#121018]/85 px-10 py-12 shadow-xl shadow-black/30">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#f5d17f]">
                Join the Sanchay Community Today!
              </p>
              <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
                Start earning and transferring loyalty points with ease.
              </h2>
            </div>
            {!isAuth && (
              <Link
                to="/register"
                className="rounded-full bg-[#f5d17f] px-10 py-4 text-sm font-semibold text-[#1f1b0f] shadow-xl shadow-[#f5d17f]/30 transition hover:scale-[1.02]"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
