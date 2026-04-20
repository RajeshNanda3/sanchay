import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
// import Verify from "./pages/Verify"; // Removed - no longer needed for SMS OTP
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import { AppData } from "./context/AppContext";
import Loading from "./Loading";
import NavBar from "./components/NavBar";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import CustomerHero from "./pages/CustomerHero";
import VendorHero from "./pages/VendorHero";
import RedeemPoint from "./pages/RedeemPoint";
import CustomerNav from "./components/CustomerNav";
import VendorNav from "./components/VendorNav";
import CustomerTransactions from "./pages/CustomerTransaction";
import CustomerProfile from "./pages/CustomerProfile";
import IssuePoint from "./pages/IssuePoint";
import VendorTransactions from "./pages/VendorTransactions";
import VendorProfile from "./pages/VendorProfile";
import VendorPurchase from "./pages/VendorPurchase";
import VendorOffers from "./pages/VendorOffers";
import ForgotPassword from "./pages/ForgotPassword";
import VendorDetails from "./pages/VendorDetails";

const App = () => {
  const { isAuth, loading, user } = AppData();
  console.log(isAuth);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* <BrowserRouter> */}

          <NavBar />
          {/* {isAuth && user && user.role === "USER" ?( <CustomerNav />) : <VendorNav/>} */}
          {isAuth &&
            user &&
            (user.role === "USER" ? <CustomerNav /> : <VendorNav />)}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/verify-otp"
              element={isAuth ? <Home /> : <VerifyOtp />}
            />
            {/* Removed /token/:token route - SMS OTP replaces email verification */}
            <Route
              path="/dashboard"
              element={isAuth ? <Dashboard /> : <Login />}
            />
            <Route path="/customer-hero" element={<CustomerHero />} />
            <Route path="/vendor-details/:id" element={<VendorDetails />} />
            <Route
              path="/customer-transactions"
              element={isAuth ? <CustomerTransactions /> : <Login />}
            />
            <Route path="/vendor-hero" element={<VendorHero />} />
            <Route
              path="/issue"
              element={isAuth ? <IssuePoint /> : <Login />}
            />
            <Route
              path="/purchase"
              element={isAuth ? <VendorPurchase /> : <Login />}
            />
            <Route
              path="/vendor-transactions"
              element={isAuth ? <VendorTransactions /> : <Login />}
            />
            <Route
              path="/vendor-profile"
              element={isAuth ? <VendorProfile /> : <Login />}
            />
            <Route
              path="/vendor-offers"
              element={isAuth ? <VendorOffers /> : <Login />}
            />
            <Route
              path="/profile"
              element={isAuth ? <CustomerProfile /> : <Login />}
            />
            <Route
              path="/redeem"
              element={isAuth ? <RedeemPoint /> : <Login />}
            />
          </Routes>
          <Footer />
          <ToastContainer />
          {/* </BrowserRouter> */}
        </>
      )}
    </>
  );
};

export default App;
