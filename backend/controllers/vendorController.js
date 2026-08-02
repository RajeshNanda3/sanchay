import { prisma } from "../config/prisma.js";
import trycatch from "../middlewares/trycatch.js";
import cloudinary from "../services/cloudinaryService.js";
import fs from "fs";
import { issuePoints } from "../services/transactionService.js";

export const createPurchaseRequest = async (req, res) => {
  try {
    const { points } = req.body;
    const vendorId = req.user.id;

    const vendor = await prisma.user.findUnique({
      where: { id: vendorId },
    });
    // console.log(vendor.name)

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found." });
    }
    const numbPoints = parseInt(points, 10);
    const request = await prisma.purchaseRequest.create({
      data: {
        vendor_id: vendorId,
        points: numbPoints,
        status: "PENDING",
      },
    });
    res.json({ message: "Purchase request created", request });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const getPurchaseRequests = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const requests = await prisma.purchaseRequest.findMany({
    where: { vendor_id: vendorId },
    orderBy: { created_at: "desc" },
  });
  res.status(200).json({
    message: "Purchase requests fetched successfully",
    requests,
  });
});

export const createVendorQrCode = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { points, title } = req.body;
  console.log(points, title);
  const parsedPoints = parseInt(points, 10);
  console.log(parsedPoints);
  if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
    return res
      .status(400)
      .json({ error: "Points must be a positive integer." });
  }
  console.log("first");
  const qrCode = await prisma.vendorQrCode.create({
    data: {
      vendor_id: vendorId,
      points: parsedPoints,
      title: title?.trim() || null,
    },
  });
  console.log(qrCode);
  res.status(201).json({
    message: "Vendor QR code created successfully",
    qrCode,
    qrValue: `vendorqr:${qrCode.qr_id}`,
  });
});

export const getVendorQrCodes = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const qrCodes = await prisma.vendorQrCode.findMany({
    where: { vendor_id: vendorId },
    orderBy: { created_at: "desc" },
  });

  res.status(200).json({
    message: "Vendor QR codes fetched successfully",
    qrCodes,
  });
});

export const updateVendorQrCode = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params;
  const { points, title, active } = req.body;

  const qrCode = await prisma.vendorQrCode.findUnique({
    where: { qr_id: id },
  });

  if (!qrCode || qrCode.vendor_id !== vendorId) {
    return res.status(404).json({ error: "QR code not found." });
  }

  const updatedQrCode = await prisma.vendorQrCode.update({
    where: { qr_id: id },
    data: {
      points:
        points !== undefined && points !== null
          ? parseInt(points, 10)
          : qrCode.points,
      title: title !== undefined ? title?.trim() || null : qrCode.title,
      active:
        active === undefined
          ? qrCode.active
          : active === "true" || active === true,
    },
  });

  res.status(200).json({
    message: "Vendor QR code updated successfully",
    qrCode: updatedQrCode,
  });
});

export const getVendorQrRequests = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const requests = await prisma.pointIssueRequest.findMany({
    where: { vendor_id: vendorId },
    orderBy: { created_at: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          mobile: true,
          userProfile: {
            select: {
              avatar: true,
            },
          },
        },
      },
      qrCode: true,
    },
  });

  res.status(200).json({
    message: "Vendor QR request list fetched successfully",
    requests,
  });
});

export const approveVendorQrRequest = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params;

  const request = await prisma.pointIssueRequest.findUnique({
    where: { request_id: id },
    include: {
      qrCode: true,
      customer: true,
    },
  });

  if (!request || request.vendor_id !== vendorId) {
    return res.status(404).json({ error: "Request not found." });
  }

  if (request.status !== "PENDING") {
    return res
      .status(400)
      .json({ error: "Only pending requests can be approved." });
  }

  const vendor = await prisma.user.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return res.status(404).json({ error: "Vendor not found." });
  }

  if (vendor.points < request.points) {
    return res.status(400).json({
      error: "Vendor does not have enough points to approve this request.",
    });
  }

  const referrerId =
    request.customer.refferred_by || "e53078e7-d9a6-4707-9c91-be3a5302e05c";

  await issuePoints(
    vendorId,
    request.customer_id,
    request.points,
    referrerId,
    null,
  );

  const updatedRequest = await prisma.pointIssueRequest.update({
    where: { request_id: id },
    data: {
      status: "APPROVED",
      approved_at: new Date(),
      approved_by: vendorId,
    },
  });

  res.status(200).json({
    message: "QR request approved successfully",
    request: updatedRequest,
  });
});

export const rejectVendorQrRequest = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params;

  const request = await prisma.pointIssueRequest.findUnique({
    where: { request_id: id },
  });

  if (!request || request.vendor_id !== vendorId) {
    return res.status(404).json({ error: "Request not found." });
  }

  if (request.status !== "PENDING") {
    return res
      .status(400)
      .json({ error: "Only pending requests can be rejected." });
  }

  const updatedRequest = await prisma.pointIssueRequest.update({
    where: { request_id: id },
    data: {
      status: "REJECTED",
      approved_at: new Date(),
      approved_by: vendorId,
    },
  });

  res.status(200).json({
    message: "QR request rejected successfully",
    request: updatedRequest,
  });
});

export const getVendorOffers = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const offers = await prisma.offer.findMany({
    where: { vendor_id: vendorId },
    orderBy: { updated_at: "desc" },
    include: {
      recipients: {
        select: {
          read: true,
          redeemed: true,
        },
      },
    },
  });

  const offersWithMetrics = offers.map((offer) => {
    const totalNotified = offer.recipients.length;
    const readCount = offer.recipients.filter((r) => r.read).length;
    const claimedCount = offer.recipients.filter((r) => r.redeemed).length;
    const { recipients, ...baseOffer } = offer;
    return {
      ...baseOffer,
      totalNotified,
      readCount,
      claimedCount,
    };
  });

  res.status(200).json({
    message: "Vendor offers fetched successfully",
    offers: offersWithMetrics,
  });
});

export const createVendorOffer = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { title, description, active } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ message: "Offer title is required." });
  }

  const offer = await prisma.offer.create({
    data: {
      vendor_id: vendorId,
      title: title.trim(),
      description: description?.trim() || "",
      active: active === undefined || active === "true" || active === true,
    },
  });

  res.status(201).json({ message: "Offer created successfully", offer });
});

export const getEligibleCustomers = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const customers = await prisma.user.findMany({
    where: {
      role: "USER",
      pointIssuancesReceived: { some: { vendor_id: vendorId } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      points: true,
      userProfile: {
        select: {
          avatar: true,
          address_at: true,
        },
      },
      pointIssuancesReceived: {
        where: { vendor_id: vendorId },
        orderBy: { ledger: { created_at: "asc" } },
        select: {
          ledger: {
            select: { created_at: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const formattedCustomers = customers.map((customer) => {
    const txs = customer.pointIssuancesReceived || [];
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      points: customer.points,
      profile_pic: customer.userProfile?.avatar || null,
      address_at: customer.userProfile?.address_at || null,
      first_transaction_date: txs.length ? txs[0].ledger.created_at : null,
      last_transaction_date: txs.length
        ? txs[txs.length - 1].ledger.created_at
        : null,
      transaction_count: txs.length,
    };
  });

  res.status(200).json({
    message: "Eligible customers fetched",
    customers: formattedCustomers,
  });
});

export const notifyOfferToCustomers = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params; // offer id
  const { recipientIds } = req.body; // array of customer ids

  const offer = await prisma.offer.findUnique({ where: { offer_id: id } });
  if (!offer || offer.vendor_id !== vendorId) {
    return res
      .status(404)
      .json({ message: "Offer not found or not owned by vendor." });
  }

  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    return res
      .status(400)
      .json({ message: "recipientIds must be a non-empty array." });
  }

  const data = recipientIds.map((customer_id) => ({
    offer_id: id,
    customer_id,
  }));

  // createMany with skipDuplicates avoids duplicate records if already notified
  await prisma.offerRecipient.createMany({ data, skipDuplicates: true });

  res
    .status(200)
    .json({ message: "Notifications queued for selected customers." });
});

export const getOfferClaims = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const claims = await prisma.offerRecipient.findMany({
    where: {
      redeemed: true,
      offer: { vendor_id: vendorId },
    },
    include: {
      offer: { select: { offer_id: true, title: true } },
      customer: {
        select: {
          id: true,
          name: true,
          mobile: true,
          userProfile: { select: { avatar: true } },
        },
      },
    },
    orderBy: { redeemed_at: "desc" },
  });

  res.status(200).json({ message: "Offer claims fetched", claims });
});

export const markOfferClaimRead = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params; // offer_recipient_id

  const claim = await prisma.offerRecipient.findUnique({
    where: { offer_recipient_id: id },
    include: { offer: true },
  });

  if (!claim || claim.offer.vendor_id !== vendorId) {
    return res.status(404).json({ message: "Claim notification not found." });
  }

  const updated = await prisma.offerRecipient.update({
    where: { offer_recipient_id: id },
    data: { vendor_read: true, vendor_read_at: new Date() },
  });

  res.status(200).json({ message: "Claim marked read", claim: updated });
});

export const updateVendorOffer = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params;
  const { title, description, active } = req.body;

  const offer = await prisma.offer.findUnique({
    where: { offer_id: id },
  });

  if (!offer || offer.vendor_id !== vendorId) {
    return res.status(404).json({ message: "Offer not found." });
  }

  const updatedOffer = await prisma.offer.update({
    where: { offer_id: id },
    data: {
      title: title !== undefined ? title.trim() : offer.title,
      description:
        description !== undefined ? description.trim() : offer.description,
      active:
        active === undefined
          ? offer.active
          : active === "true" || active === true,
    },
  });

  res
    .status(200)
    .json({ message: "Offer updated successfully", offer: updatedOffer });
});

export const getVendorRatings = trycatch(async (req, res) => {
  const { id } = req.params;
  const ratings = await prisma.rating.findMany({
    where: { vendor_id: id },
    orderBy: { updated_at: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const summary = await prisma.rating.aggregate({
    where: { vendor_id: id },
    _avg: { stars: true },
    _count: { stars: true },
  });

  res.status(200).json({
    message: "Vendor ratings fetched successfully",
    ratings,
    averageRating: summary._avg.stars || 0,
    totalRatings: summary._count.stars || 0,
  });
});

export const rateVendor = trycatch(async (req, res) => {
  const vendorId = req.params.id;
  const customerId = req.user.id;
  const { stars, comment } = req.body;

  if (!stars || typeof stars !== "number") {
    return res.status(400).json({ message: "Rating stars are required." });
  }

  if (stars < 1 || stars > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  const vendor = await prisma.user.findUnique({
    where: { id: vendorId, role: "VENDOR" },
  });

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found." });
  }

  const rating = await prisma.rating.upsert({
    where: {
      vendor_id_customer_id: {
        vendor_id: vendorId,
        customer_id: customerId,
      },
    },
    update: {
      stars,
      comment: comment?.trim() || null,
    },
    create: {
      vendor_id: vendorId,
      customer_id: customerId,
      stars,
      comment: comment?.trim() || null,
    },
  });

  res.status(200).json({
    message: "Rating saved successfully",
    rating,
  });
});

export const getVendorById = trycatch(async (req, res) => {
  const { id } = req.params;
  const vendor = await prisma.user.findUnique({
    where: { id, role: "VENDOR" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      created_at: true,
      vendorProfile: {
        select: {
          store_name: true,
          deals_with: true,
          category: true,
          address_at: true,
          address_po: true,
          address_market: true,
          address_dist: true,
          address_pin: true,
          address_state: true,
          address_block: true,
          avatar: true,
          banner: true,
        },
      },
    },
  });
  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }
  res.status(200).json({
    message: "Vendor fetched successfully",
    vendor,
  });
});

/* ===================== VENDOR PROFILE ENDPOINTS ===================== */

export const getVendorProfile = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  console.log("hii deepak", vendorId);

  const profile = await prisma.vendorProfile.findUnique({
    where: { vendor_id: vendorId },
  });

  if (!profile) {
    return res.status(404).json({ message: "Vendor profile not found here" });
  }

  res.status(200).json({
    message: "Vendor profile fetched successfully",
    profile,
  });
});

export const upsertVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const {
      store_name,
      category,
      market_name,
      deals_with,
      address_at,
      address_po,
      address_market,
      address_dist,
      address_pin,
      address_state,
      address_block,
      latitude,
      longitude,
    } = req.body || {};

    // Parse deals_with if it's a string
    let dealsWithArray = [];
    if (deals_with) {
      if (typeof deals_with === "string") {
        dealsWithArray = deals_with
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
      } else if (Array.isArray(deals_with)) {
        dealsWithArray = deals_with;
      }
    }

    // Prepare data object
    const parsedLatitude = latitude !== undefined ? Number(latitude) : null;
    const parsedLongitude = longitude !== undefined ? Number(longitude) : null;

    const data = {
      store_name: store_name || null,
      category: category || null,
      market_name: market_name || null,
      deals_with: dealsWithArray,
      address_at: address_at || null,
      address_po: address_po || null,
      address_market: address_market || null,
      address_dist: address_dist || null,
      address_pin: address_pin || null,
      address_state: address_state || null,
      address_block: address_block || null,
      latitude:
        parsedLatitude !== null && Number.isFinite(parsedLatitude)
          ? parsedLatitude
          : null,
      longitude:
        parsedLongitude !== null && Number.isFinite(parsedLongitude)
          ? parsedLongitude
          : null,
      location_updated_at: new Date(),
    };

    // If images uploaded (supports avatar and banner)
    try {
      if (req.files) {
        // avatar
        const avatarFiles = req.files.avatar || [];
        if (avatarFiles.length > 0) {
          const filePath = avatarFiles[0].path;
          const result = await cloudinary.uploader.upload(filePath, {
            folder: "vendor_profiles",
            public_id: `vendor_${vendorId}_avatar_${Date.now()}`,
            overwrite: true,
          });
          data.avatar = result.secure_url;
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn("Failed to remove temp avatar file", e);
          }
        }

        // banner
        const bannerFiles = req.files.banner || [];
        if (bannerFiles.length > 0) {
          const filePathB = bannerFiles[0].path;
          const resultB = await cloudinary.uploader.upload(filePathB, {
            folder: "vendor_profiles",
            public_id: `vendor_${vendorId}_banner_${Date.now()}`,
            overwrite: true,
          });
          data.banner = resultB.secure_url;
          try {
            fs.unlinkSync(filePathB);
          } catch (e) {
            console.warn("Failed to remove temp banner file", e);
          }
        }
      }
    } catch (e) {
      console.error("Image upload failed:", e);
      // continue without failing the whole request; images are optional
    }

    // Upsert vendor profile
    const profile = await prisma.vendorProfile.upsert({
      where: { vendor_id: vendorId },
      update: data,
      create: {
        vendor_id: vendorId,
        store_name: store_name || "Store",
        ...data,
      },
    });

    res.status(200).json({
      message: "Vendor profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error("Vendor profile error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getVendorOffersPublic = trycatch(async (req, res) => {
  const { id } = req.params;
  const offers = await prisma.offer.findMany({
    where: { vendor_id: id, active: true },
    orderBy: { updated_at: "desc" },
  });
  res.status(200).json({
    message: "Vendor offers fetched successfully",
    offers,
  });
});
