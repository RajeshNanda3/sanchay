import { prisma } from "../config/prisma.js";
import trycatch from "../middlewares/trycatch.js";
import cloudinary from "../services/cloudinaryService.js";
import fs from "fs";

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

export const getVendorOffers = trycatch(async (req, res) => {
  const vendorId = req.user.id;
  const offers = await prisma.offer.findMany({
    where: { vendor_id: vendorId },
    orderBy: { updated_at: "desc" },
  });
  res.status(200).json({
    message: "Vendor offers fetched successfully",
    offers,
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
    };

    // If image uploaded
    if (req.file) {
      const filePath = req.file.path;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "vendor_profiles",
        public_id: `vendor_${vendorId}_${Date.now()}`,
        overwrite: true,
      });

      // Save image URL
      data.avatar = result.secure_url;

      // Delete temp file
      fs.unlinkSync(filePath);
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
