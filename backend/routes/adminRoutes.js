import express from "express";
import {
  approvePurchaseRequestHandler,
  rejectPurchaseRequestHandler,
  getPendingRequestsHandler,
  getAdminMetricsHandler,
  getMetricsSummaryHandler,
  getDayWiseIssuesHandler,
  getReferrerJoinsHandler,
  getVendorSpendingHandler,
  getAllVendorsAdmin,
  toggleVendorStatus,
} from "../controllers/adminController.js";
import { isAuth, authorizedAdmin } from "../middlewares/isAuth.js";
const router = express.Router();

router.get(
  "/pending-requests",
  isAuth,
  authorizedAdmin,
  getPendingRequestsHandler,
);
router.get("/metrics", isAuth, authorizedAdmin, getAdminMetricsHandler);
router.get(
  "/metrics/summary",
  isAuth,
  authorizedAdmin,
  getMetricsSummaryHandler,
);
router.get(
  "/metrics/day-wise-issues",
  isAuth,
  authorizedAdmin,
  getDayWiseIssuesHandler,
);
router.get(
  "/metrics/referrer-joins",
  isAuth,
  authorizedAdmin,
  getReferrerJoinsHandler,
);
router.get(
  "/metrics/vendor-spending",
  isAuth,
  authorizedAdmin,
  getVendorSpendingHandler,
);
router.post(
  "/approve-purchase-request",
  isAuth,
  authorizedAdmin,
  approvePurchaseRequestHandler,
);
router.post(
  "/reject-purchase-request",
  isAuth,
  authorizedAdmin,
  rejectPurchaseRequestHandler,
);
router.get("/vendors", isAuth, authorizedAdmin, getAllVendorsAdmin);
router.post(
  "/vendors/:vendorId/toggle-status",
  isAuth,
  authorizedAdmin,
  toggleVendorStatus,
);
export default router;
