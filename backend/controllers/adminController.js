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
      return res.status(400).json({
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

// Admin metrics: users/vendors counts, day-wise issues, referrer joins, vendor spending
export const getAdminMetricsHandler = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const totalVendors = await prisma.user.count({ where: { role: "VENDOR" } });

    const issuances = await prisma.pointIssuance.findMany({
      include: { ledger: { select: { created_at: true } } },
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const dayWiseMap = new Map();
    const vendorSpendingMap = new Map();

    issuances.forEach((issuance) => {
      const createdAt = issuance.ledger?.created_at;
      if (createdAt && createdAt >= cutoff) {
        const date = createdAt.toISOString().split("T")[0];
        const key = `${issuance.vendor_id}-${date}`;
        const existing = dayWiseMap.get(key);

        if (existing) {
          existing.total_points += issuance.points_issued;
          existing.issues_count += 1;
        } else {
          dayWiseMap.set(key, {
            vendor_id: issuance.vendor_id,
            date,
            total_points: issuance.points_issued,
            issues_count: 1,
          });
        }
      }

      const vendorSpending = vendorSpendingMap.get(issuance.vendor_id) || {
        vendor_id: issuance.vendor_id,
        total_points: 0,
      };
      vendorSpending.total_points += issuance.points_issued;
      vendorSpendingMap.set(issuance.vendor_id, vendorSpending);
    });

    const dayWiseIssues = Array.from(dayWiseMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const vendorSpendingOverall = Array.from(vendorSpendingMap.values()).sort(
      (a, b) => b.total_points - a.total_points,
    );

    const referrerJoins = await prisma.$queryRaw`
      SELECT refferred_by AS referrer, COUNT(*) AS total
      FROM "User"
      WHERE refferred_by IS NOT NULL AND refferred_by != ''
      GROUP BY refferred_by
      ORDER BY total DESC
    `;

    res.status(200).json({
      totals: { totalUsers, totalVendors },
      dayWiseIssues,
      referrerJoins,
      vendorSpendingOverall,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Separate metrics endpoints for professional analytics

// Summary: Total users and vendors
export const getMetricsSummaryHandler = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const totalVendors = await prisma.user.count({ where: { role: "VENDOR" } });
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });

    const totalPointsIssued = await prisma.pointIssuance.aggregate({
      _sum: { points_issued: true },
    });

    const totalPointsRedeemed = await prisma.redemption.aggregate({
      _sum: { points_used: true },
    });

    res.status(200).json({
      data: {
        totalUsers,
        totalVendors,
        totalAdmins,
        totalPointsIssued: totalPointsIssued._sum.points_issued || 0,
        totalPointsRedeemed: totalPointsRedeemed._sum.points_used || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Day-wise issues with vendor details
export const getDayWiseIssuesHandler = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(days));

    const issuances = await prisma.pointIssuance.findMany({
      where: { ledger: { created_at: { gte: cutoff } } },
      select: {
        vendor_id: true,
        points_issued: true,
        ledger: { select: { created_at: true } },
      },
    });

    const grouped = new Map();
    issuances.forEach((issuance) => {
      const createdAt = issuance.ledger?.created_at;
      if (!createdAt) return;
      const date = createdAt.toISOString().split("T")[0];
      const key = `${issuance.vendor_id}-${date}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.total_points += issuance.points_issued;
        existing.issues_count += 1;
      } else {
        grouped.set(key, {
          vendor_id: issuance.vendor_id,
          date,
          total_points: issuance.points_issued,
          issues_count: 1,
        });
      }
    });

    const rawData = Array.from(grouped.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const vendorIds = [...new Set(rawData.map((r) => r.vendor_id))];
    const vendors = await prisma.user.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, name: true, email: true },
    });

    const vendorMap = vendors.reduce((map, v) => {
      map[v.id] = v;
      return map;
    }, {});

    const enriched = rawData.map((item) => ({
      ...item,
      vendor: vendorMap[item.vendor_id] || {
        id: item.vendor_id,
        name: "Unknown",
      },
    }));

    res.status(200).json({ data: enriched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Referrer joins with user details
export const getReferrerJoinsHandler = async (req, res) => {
  try {
    const rawData = await prisma.$queryRaw`
      SELECT refferred_by AS referrer_id, COUNT(*) AS total_joins
      FROM "User"
      WHERE refferred_by IS NOT NULL AND refferred_by != ''
      GROUP BY refferred_by
      ORDER BY total_joins DESC
    `;

    // Enrich with referrer names
    const referrerIds = rawData.map((r) => r.referrer_id);
    const referrers = await prisma.user.findMany({
      where: { id: { in: referrerIds } },
      select: { id: true, name: true, email: true, role: true },
    });

    const referrerMap = referrers.reduce((map, v) => {
      map[v.id] = v;
      return map;
    }, {});

    const enriched = rawData.map((item) => ({
      referrer_id: item.referrer_id,
      referrer: referrerMap[item.referrer_id] || {
        id: item.referrer_id,
        name: "Unknown",
      },
      total_joins: Number(item.total_joins),
    }));

    res.status(200).json({ data: enriched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Vendor spending overall and day-wise
export const getVendorSpendingHandler = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(days));

    const issuances = await prisma.pointIssuance.findMany({
      include: { ledger: { select: { created_at: true } } },
    });

    const overallMap = new Map();
    const dayWiseMap = new Map();

    issuances.forEach((issuance) => {
      const vendorSpending = overallMap.get(issuance.vendor_id) || {
        vendor_id: issuance.vendor_id,
        total_points: 0,
        transaction_count: 0,
      };
      vendorSpending.total_points += issuance.points_issued;
      vendorSpending.transaction_count += 1;
      overallMap.set(issuance.vendor_id, vendorSpending);

      const createdAt = issuance.ledger?.created_at;
      if (!createdAt || createdAt < cutoff) return;
      const date = createdAt.toISOString().split("T")[0];
      const dayKey = `${issuance.vendor_id}-${date}`;
      const existing = dayWiseMap.get(dayKey) || {
        vendor_id: issuance.vendor_id,
        date,
        total_points: 0,
        transaction_count: 0,
      };
      existing.total_points += issuance.points_issued;
      existing.transaction_count += 1;
      dayWiseMap.set(dayKey, existing);
    });

    const overallSpending = Array.from(overallMap.values()).sort(
      (a, b) => b.total_points - a.total_points,
    );
    const dayWiseSpending = Array.from(dayWiseMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const vendorIds = [
      ...new Set([
        ...overallSpending.map((r) => r.vendor_id),
        ...dayWiseSpending.map((r) => r.vendor_id),
      ]),
    ];

    const vendors = await prisma.user.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, name: true, email: true, role: true },
    });

    const vendorMap = vendors.reduce((map, v) => {
      map[v.id] = v;
      return map;
    }, {});

    const enrichedOverall = overallSpending.map((item) => ({
      vendor_id: item.vendor_id,
      vendor: vendorMap[item.vendor_id] || {
        id: item.vendor_id,
        name: "Unknown",
      },
      total_points: item.total_points,
      transaction_count: item.transaction_count,
    }));

    const enrichedDaywise = dayWiseSpending.map((item) => ({
      vendor_id: item.vendor_id,
      vendor: vendorMap[item.vendor_id] || {
        id: item.vendor_id,
        name: "Unknown",
      },
      date: item.date,
      total_points: item.total_points,
      transaction_count: item.transaction_count,
    }));

    res.status(200).json({
      data: {
        overall: enrichedOverall,
        dayWise: enrichedDaywise,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
