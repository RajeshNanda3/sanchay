import express from "express";
import { upload } from "../middlewares/multer.js";
import uploadOnCloudinary from "../middlewares/cloudinary.js";
import fs from "fs";
import { rateLimiter } from "../middlewares/ratelimiter.js";
import {
  registerUser,
  verifyOTPRegister,
} from "../controllers/userController2.js";

import {
  // registerUser,
  verifyUser,
  // verifyOTPRegister,
  loginUser,
  verifyOtp,
  myProfile,
  getProfile,
  upsertProfile,
  refreshToken,
  logoutUser,
  refreshCSRF,
  adminController,
  getAllVendors,
  getAllCustomers,
  updateProfile,
  checkReferrer,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { is } from "zod/v4/locales";
import { authorizedAdmin, isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = express.Router();
// Sample route for user registration
router.post("/register",
  rateLimiter({
    windowSeconds: 60,
    maxAttempts: 3,
    keyGenerator: (req) => req.body.mobile,
    message: "Please wait before requesting another OTP.",
  }), registerUser);
router.post("/register/verify-otp", verifyOTPRegister); // NEW: OTP verification for registration
router.post("/check-referrer", checkReferrer);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/me", isAuth, myProfile);
router.put("/update-profile", isAuth, updateProfile);

// profile detail endpoints
router.get("/profile", isAuth, getProfile);
router.post("/profile", isAuth, upload.single("avatar"), upsertProfile);

router.get("/vendors", isAuth, getAllVendors);
router.get("/customers", isAuth, getAllCustomers);
router.post("/refresh", refreshToken);
router.post("/logout", isAuth, logoutUser);
router.post("/refresh-csrf", isAuth, refreshCSRF);
// router.get('/profile/:userId', getUserProfile);

// router.get('/admin', isAuth, authorizedAdmin, adminController)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
