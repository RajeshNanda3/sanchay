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

router.get("/offers", isAuth, authorizedVendor, getVendorOffers);
router.post("/offers", isAuth, authorizedVendor, createVendorOffer);
router.put("/offers/:id", isAuth, authorizedVendor, updateVendorOffer);

// Vendor Profile endpoints (MUST be before /:id route)
router.get("/profile", isAuth, authorizedVendor, getVendorProfile);
router.post(
  "/profile",
  isAuth,
  authorizedVendor,
  upload.single("avatar"),
  upsertVendorProfile,
);

// Dynamic routes (MUST be after specific routes)
router.get("/:id/ratings", getVendorRatings);
router.post("/:id/rate", isAuth, rateVendor);
router.get("/:id/offers", getVendorOffersPublic);
router.get("/:id", getVendorById);

export default router;
