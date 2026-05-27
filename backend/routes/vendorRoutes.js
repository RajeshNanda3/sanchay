import express from "express";
import { upload } from "../middlewares/multer.js";
import {
  createPurchaseRequest,
  getPurchaseRequests,
  getVendorProfile,
  upsertVendorProfile,
  getVendorOffers,
  createVendorOffer,
  updateVendorOffer,
  getVendorOffersPublic,
  getVendorRatings,
  rateVendor,
  getVendorById,
  createVendorQrCode,
  getVendorQrCodes,
  updateVendorQrCode,
  getVendorQrRequests,
  approveVendorQrRequest,
  rejectVendorQrRequest,
} from "../controllers/vendorController.js";
import { isAuth, authorizedVendor } from "../middlewares/isAuth.js";

const router = express.Router();

router.post(
  "/create-purchase-request",
  isAuth,
  authorizedVendor,
  createPurchaseRequest,
);
router.get("/purchase-requests", isAuth, authorizedVendor, getPurchaseRequests);

router.post("/qr-codes", isAuth, authorizedVendor, createVendorQrCode);
router.get("/qr-codes", isAuth, authorizedVendor, getVendorQrCodes);
router.put("/qr-codes/:id", isAuth, authorizedVendor, updateVendorQrCode);

router.get("/qr-requests", isAuth, authorizedVendor, getVendorQrRequests);
router.post(
  "/qr-requests/:id/approve",
  isAuth,
  authorizedVendor,
  approveVendorQrRequest,
);
router.post(
  "/qr-requests/:id/reject",
  isAuth,
  authorizedVendor,
  rejectVendorQrRequest,
);

router.get("/offers", isAuth, authorizedVendor, getVendorOffers);
router.post("/offers", isAuth, authorizedVendor, createVendorOffer);
router.put("/offers/:id", isAuth, authorizedVendor, updateVendorOffer);

// Vendor Profile endpoints (MUST be before /:id route)
router.get("/profile", isAuth, authorizedVendor, getVendorProfile);
router.post(
  "/profile",
  isAuth,
  authorizedVendor,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  upsertVendorProfile,
);

// Dynamic routes (MUST be after specific routes)
router.get("/:id/ratings", getVendorRatings);
router.post("/:id/rate", isAuth, rateVendor);
router.get("/:id/offers", getVendorOffersPublic);
router.get("/:id", getVendorById);

export default router;
