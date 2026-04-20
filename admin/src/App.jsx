import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppData } from "./context/AppContext";
import Loading from "./Loading";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import NavBar from "./components/NavBar";

const App = () => {
  const { isAuth, loading } = AppData();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          {isAuth && <NavBar />}
          <Routes>
            <Route path="/login" element={isAuth ? <Dashboard /> : <Login />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route
              path="/dashboard"
              element={isAuth ? <Dashboard /> : <Login />}
            />
            <Route
              path="/transactions"
              element={isAuth ? <Transactions /> : <Login />}
            />
            <Route path="/" element={isAuth ? <Dashboard /> : <Login />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
