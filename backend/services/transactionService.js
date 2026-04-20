import { prisma } from "../config/prisma.js";

// Utility: Apply balance updates
const updateBalance = async (tx, userId, amount, direction) => {
  if (!userId) return;

  if (direction === "CREDIT") {
    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    });
  } else {
    await tx.user.update({
      where: { id: userId },
      data: { points: { decrement: amount } },
    });
  }
};

//  Vendor Purchases Points (CREDIT vendor)
export const purchasePoints = async (vendorId, points) => {
  return prisma.$transaction(async (tx) => {
    const ledger = await tx.transactionLedger.create({
      data: {
        user_id: vendorId,
        corespondance_id: vendorId,
        type: "PURCHASE",
        direction: "CREDIT",
        amount: points,
      },
    });

    await tx.vendorPurchase.create({
      data: {
        transaction_id: ledger.transaction_id,
        vendor_id: vendorId,
        points_purchased: points,
      },
    });

    // Update vendor balance
    await updateBalance(tx, vendorId, points, "CREDIT");

    return ledger;
  });
};

//  Vendor Issues Points → customer (credit) & vendor (debit)
export const issuePoints = async (
  vendorId,
  customerIdToUse,
  points,
  referrerId,
  billAmount,
) => {
  let customerId = customerIdToUse;
  const billValue = Number(billAmount);
  const billAmountInt = Number.isFinite(billValue)
    ? Math.round(billValue)
    : null;
  return prisma.$transaction(async (tx) => {
    //  10% referral commission
    const commission = referrerId ? Math.floor(points * 0.1) : 0;
    const netPoints = points - commission;

    //  Vendor DEBIT
    const vendorLedger = await tx.transactionLedger.create({
      data: {
        user_id: vendorId,
        correspondent_id: customerId,
        type: "ISSUE",
        direction: "DEBIT",
        amount: points,
      },
    });
    console.log("1st transaction");
    await tx.pointIssuance.create({
      data: {
        transaction_id: vendorLedger.transaction_id,
        vendor_id: vendorId,
        customer_id: customerId,
        points_issued: points,
        bill_amount: billAmountInt,
      },
    });

    //  Customer CREDIT
    await tx.transactionLedger.create({
      data: {
        user_id: customerId,
        correspondent_id: vendorId,
        type: "ISSUE",
        direction: "CREDIT",
        amount: netPoints,
      },
    });
    console.log("2nd transaction");
    console.log(referrerId, "comision amount");
    //  Referral CREDIT
    if (referrerId && commission > 0) {
      console.log(referrerId, commission, customerId);
      const isUser = await tx.user.findUnique({
        where: { id: referrerId.trim() },
      });
      // console.log(isUser)
      if (!isUser) {
        throw new Error("Referrer not found.");
      }
      await tx.transactionLedger.create({
        data: {
          user_id: referrerId,
          correspondent_id: customerId,
          type: "REFERRAL",
          direction: "CREDIT",
          amount: commission,
        },
      });
      console.log("3rd transaction");
      await tx.referralCommission.create({
        data: {
          transaction_id: vendorLedger.transaction_id,
          referrer_id: referrerId,
          beneficiary_id: customerId,
          commission_points: commission,
        },
      });
    }

    // Update balances
    await updateBalance(tx, vendorId, points, "DEBIT");
    await updateBalance(tx, customerId, netPoints, "CREDIT");
    if (referrerId) await updateBalance(tx, referrerId, commission, "CREDIT");

    return { vendorLedger };
  });
};

//  Customer Redeems Points With Vendor
export const redeemPoints = async (customerId, vendorIdToUse, points) => {
  const vendorId = vendorIdToUse;
  return prisma.$transaction(async (tx) => {
    const ledger = await tx.transactionLedger.create({
      data: {
        user_id: customerId,
        correspondent_id: vendorId,
        type: "REDEEM",
        direction: "DEBIT",
        amount: points,
      },
    });

    await tx.redemption.create({
      data: {
        transaction_id: ledger.transaction_id,
        customer_id: customerId,
        vendor_id: vendorId,
        points_used: points,
      },
    });

    // Vendor CREDIT ledger
    await tx.transactionLedger.create({
      data: {
        user_id: vendorId,
        correspondent_id: customerId,
        type: "REDEEM",
        direction: "CREDIT",
        amount: points,
      },
    });

    // Update balances
    await updateBalance(tx, customerId, points, "DEBIT");
    await updateBalance(tx, vendorId, points, "CREDIT");

    return ledger;
  });
};

//  Vendor → Vendor Transfer
export const transferPoints = async (
  senderVendorId,
  receiverVendorId,
  points,
) => {
  return prisma.$transaction(async (tx) => {
    const ledger = await tx.transactionLedger.create({
      data: {
        user_id: senderVendorId,
        corespondance_id: receiverVendorId,
        type: "VENDOR_TRANSFER",
        direction: "DEBIT",
        amount: BigInt(points),
      },
    });

    await tx.vendorTransfer.create({
      data: {
        transaction_id: ledger.transaction_id,
        sender_vendor_id: senderVendorId,
        receiver_vendor_id: receiverVendorId,
        points_transferred: BigInt(points),
      },
    });

    // Receiver CREDIT ledger
    await tx.transactionLedger.create({
      data: {
        user_id: receiverVendorId,
        corespondance_id: senderVendorId,
        type: "VENDOR_TRANSFER",
        direction: "CREDIT",
        amount: BigInt(points),
      },
    });

    // Update balances
    await updateBalance(tx, senderVendorId, points, "DEBIT");
    await updateBalance(tx, receiverVendorId, points, "CREDIT");

    return ledger;
  });
};
