import {
  purchasePoints,
  issuePoints,
  redeemPoints,
  transferPoints,
} from "../services/transactionService.js";
import { prisma } from "../config/prisma.js";

export const purchasePointsHandler = async (req, res) => {
  try {
    const { vendorId, points } = req.body;
    const ledger = await purchasePoints(vendorId, points);
    res.json({ message: "Purchase successful", ledger });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const issuePointsHandler = async (req, res) => {
  try {
    let { customerId, mobile, points, billAmount } = req.body;
    const vendorId = req.user.id;

    const parsedPoints = parseInt(points, 10);
    const parsedBillAmount = billAmount === undefined || billAmount === null || billAmount === "" ? null : Number(billAmount);

    if (!vendorId || Number.isNaN(parsedPoints)) {
      return res
        .status(400)
        .json({ error: "vendorId and valid points are required." });
    }

    if (billAmount !== undefined && billAmount !== null && billAmount !== "" && !Number.isFinite(parsedBillAmount)) {
      return res.status(400).json({ error: "billAmount must be a valid number." });
    }

    if (!customerId && !mobile) {
      return res
        .status(400)
        .json({ error: "Either customerId or mobile is required." });
    }

    //  Check vendor exists
    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
    });
    console.log(vendor.name);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found." });
    }

    //  Check customer exists
    const customer = await prisma.user.findUnique({
      where: customerId ? { id: customerId } : { mobile: mobile },
    });
    // const customerIdToUse = customerId || (customer ? customer.id : null);
    let customerIdToUse = customer ? customer.id : null;

    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    const referrerId =
      customer.refferred_by || "e53078e7-d9a6-4707-9c91-be3a5302e05c";

    //  Check referrer exists (if provided)
    // let referrer = null;
    // if (referrerId) {
    //   referrer = await prisma.user.findUnique({
    //     where: { id: referrerId }
    //   });

    //   if (!referrer) {
    //     return res.status(404).json({ error: "Referrer not found." });
    //   }
    // }

    //  Vendor must have enough balance
    const pointsNeeded = parsedPoints;
    if (vendor.points < pointsNeeded) {
      return res.status(400).json({
        error: `Vendor does not have enough points. Available: ${vendor.points}, Required: ${pointsNeeded}`,
      });
    }

    //  Perform transaction
    const ledger = await issuePoints(
      vendorId,
      customerIdToUse,
      parsedPoints,
      referrerId,
      parsedBillAmount,
    );

    res.json({ message: "Points issued successfully", ledger });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const redeemPointsHandler = async (req, res) => {
  try {
    let { mobile, vendorId, points } = req.body;
    const customerId = req.user.id;
    console.log(req.body, customerId);

    if (!mobile && !vendorId) {
      return res
        .status(400)
        .json({ error: "Either mobile or vendorId is required." });
    }
    if (!customerId || !points) {
      return res
        .status(400)
        .json({ error: "customerId and points are required." });
    }

    //  Check customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    // check vendor exists
    const vendor = await prisma.user.findUnique({
      where: vendorId ? { id: vendorId } : { mobile: mobile },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found." });
    }
    let vendorIdToUse = vendorId || (vendor ? vendor.id : null);
    if (customer.points < points) {
      return res.status(400).json({
        error: `Customer does not have enough points. Available: ${customer.points}, Required: ${points}`,
      });
    }

    const ledger = await redeemPoints(customerId, vendorIdToUse, points);
    res.json({ message: "Redemption successful", ledger });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const transferPointsHandler = async (req, res) => {
  try {
    const { senderVendorId, receiverVendorId, points } = req.body;
    const ledger = await transferPoints(
      senderVendorId,
      receiverVendorId,
      points,
    );
    res.json({ message: "Transfer successful", ledger });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getCustomerTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate } = req.query;

    // Build filter
    const where = {
      OR: [{ user_id: userId }, { correspondent_id: userId }],
    };

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    const ledger = await prisma.transactionLedger.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true } },
        correspondent: {
          select: { id: true, name: true, email: true, mobile: true },
        },
        point_issuance: true,
        redemption: true,
        referral_commission: true,
        vendor_transfer: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      message: "Transactions fetched successfully",
      transactions: ledger,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const getVendorTransactions = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { type, startDate, endDate } = req.query;

    // Build filter - only where vendor is the user_id (primary actor)
    const where = {
      user_id: vendorId,
    };

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    const ledger = await prisma.transactionLedger.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true } },
        correspondent: {
          select: { id: true, name: true, email: true, mobile: true },
        },
        point_issuance: true,
        redemption: true,
        referral_commission: true,
        vendor_transfer: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      message: "Vendor transactions fetched successfully",
      transactions: ledger,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const getCustomerIssueHistory = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Fetch all point issuances from this vendor to this customer
    const history = await prisma.pointIssuance.findMany({
      where: {
        vendor_id: vendorId,
        customer_id: customerId,
      },
      include: {
        ledger: true,
        vendor: { select: { id: true, name: true, mobile: true } },
        customer: { select: { id: true, name: true, mobile: true } },
      },
      orderBy: { ledger: { created_at: "desc" } },
    });

    res.status(200).json({
      message: "Customer issue history fetched successfully",
      history,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
