import { prisma } from "../config/prisma.js";
import { purchasePoints } from "../services/transactionService.js";

export const approvePurchaseRequestHandler = async (req, res) => {
  try {
    const { requestId } = req.body;
    const adminId = req.user.id;

    if (!requestId || !adminId) {
      return res
        .status(400)
        .json({ error: "requestId and adminId are required" });
    }

    //  Fetch purchase request
    const request = await prisma.purchaseRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({ error: "Request already processed" });
    }

    //  Validate vendor
    const vendor = await prisma.user.findUnique({
      where: { id: request.vendor_id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const adminPoints = admin.points || 0;
    if (adminPoints < request.points) {
      return res
        .status(400)
        .json({
          error: "Admin does not have enough points to approve this request",
        });
    }
    //  Perform approval transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark request as approved
      await tx.purchaseRequest.update({
        where: { request_id: requestId },
        data: {
          status: "APPROVED",
          approved_by: adminId,
          approved_at: new Date(),
        },
      });

      //  Create ledger entry (CREDIT to vendor)
      const ledger = await tx.transactionLedger.create({
        data: {
          user_id: adminId,
          correspondent_id: request.vendor_id,
          type: "PURCHASE",
          direction: "DEBIT",
          amount: request.points,
          // user: { connect: { id: adminId } },
          // correspondent: { connect: { id: request.vendor_id  } }
        },
      });

      //  Create vendorPurchase record
      await tx.vendorPurchase.create({
        data: {
          transaction_id: ledger.transaction_id,
          vendor_id: vendor.id,
          points_purchased: request.points,
        },
      });
      await tx.transactionLedger.create({
        data: {
          user_id: vendor.id,
          correspondent_id: adminId,
          type: "PURCHASE",
          direction: "CREDIT",
          amount: request.points,
          // user: { connect: { id: vendor.id } },
          // correspondent: { connect: { id: adminId } }
        },
      });

      //  Update vendor points
      await tx.user.update({
        where: { id: vendor.id },
        data: { points: { increment: request.points } },
      });
      // Update admin points
      await tx.user.update({
        where: { id: adminId },
        data: { points: { decrement: request.points } },
      });

      return ledger;
    });

    res.json({
      message: "Request approved successfully",
      ledger: result,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

// Rejecting purchase request

export const rejectPurchaseRequestHandler = async (req, res) => {
  try {
    const { requestId } = req.body;
    const adminId = req.user.id;

    if (!requestId)
      return res.status(400).json({ error: "requestId is required" });

    const request = await prisma.purchaseRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "PENDING")
      return res.status(400).json({ error: "Request already processed" });

    const updated = await prisma.purchaseRequest.update({
      where: { request_id: requestId },
      data: {
        status: "REJECTED",
        approved_by: adminId,
        approved_at: new Date(),
      },
    });

    res.json({ message: "Request rejected", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all pending purchase requests for admin dashboard
export const getPendingRequestsHandler = async (req, res) => {
  try {
    // fetch purchase requests without relations
    const requests = await prisma.purchaseRequest.findMany({
      orderBy: [
        { status: "asc" }, // PENDING first
        { created_at: "desc" },
      ],
    });

    // gather unique vendor IDs and load their info
    const vendorIds = [...new Set(requests.map((r) => r.vendor_id))];
    const vendors = await prisma.user.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, name: true, email: true, mobile: true },
    });

    const vendorMap = vendors.reduce((map, v) => {
      map[v.id] = v;
      return map;
    }, {});

    const enriched = requests.map((r) => ({
      ...r,
      vendor: vendorMap[r.vendor_id] || null,
    }));

    res.status(200).json({
      message: "Purchase requests fetched successfully",
      requests: enriched,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
