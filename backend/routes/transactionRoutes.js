import express from "express";
import {
  purchasePointsHandler,
  issuePointsHandler,
  redeemPointsHandler,
  transferPointsHandler,
  getCustomerTransactions,
  getVendorTransactions,
  getCustomerIssueHistory,
} from "../controllers/transactionController.js";
import { isAuth, authorizedVendor } from "../middlewares/isAuth.js";

const router = express.Router();

//  Vendor purchases points
router.post("/purchase", purchasePointsHandler);

//  Vendor issues points to customer
router.post("/issue", isAuth, authorizedVendor, issuePointsHandler);

//  Customer redeems points at vendor

router.post("/redeem", isAuth, redeemPointsHandler);

//  Customer gets transactions
router.get("/transactions", isAuth, getCustomerTransactions);

//  Vendor gets transactions (only where vendor is primary actor)
router.get(
  "/vendor-transactions",
  isAuth,
  authorizedVendor,
  getVendorTransactions,
);

//  Vendor gets issue history with a specific customer
router.get(
  "/customer-issue-history/:customerId",
  isAuth,
  authorizedVendor,
  getCustomerIssueHistory,
);

//  Vendor to vendor transfer
router.post("/transfer", transferPointsHandler);

export default router;
