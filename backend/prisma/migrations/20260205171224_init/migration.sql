-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TxnType" AS ENUM ('PURCHASE', 'ISSUE', 'REDEEM', 'REFERRAL', 'VENDOR_TRANSFER');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "role" "EntityType" NOT NULL DEFAULT 'USER',
    "password" TEXT NOT NULL,
    "refferred_by" TEXT,
    "refferal_code" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionLedger" (
    "transaction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "correspondent_id" TEXT NOT NULL,
    "type" "TxnType" NOT NULL,
    "direction" "Direction" NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "VendorPurchase" (
    "purchase_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "points_purchased" INTEGER NOT NULL,

    CONSTRAINT "VendorPurchase_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "PointIssuance" (
    "issuance_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "points_issued" INTEGER NOT NULL,

    CONSTRAINT "PointIssuance_pkey" PRIMARY KEY ("issuance_id")
);

-- CreateTable
CREATE TABLE "Redemption" (
    "redemption_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "points_used" INTEGER NOT NULL,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("redemption_id")
);

-- CreateTable
CREATE TABLE "ReferralCommission" (
    "referral_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "commission_points" INTEGER NOT NULL,

    CONSTRAINT "ReferralCommission_pkey" PRIMARY KEY ("referral_id")
);

-- CreateTable
CREATE TABLE "VendorTransfer" (
    "transfer_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "sender_vendor_id" TEXT NOT NULL,
    "receiver_vendor_id" TEXT NOT NULL,
    "points_transferred" INTEGER NOT NULL,

    CONSTRAINT "VendorTransfer_pkey" PRIMARY KEY ("transfer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_refferal_code_key" ON "User"("refferal_code");

-- CreateIndex
CREATE UNIQUE INDEX "VendorPurchase_transaction_id_key" ON "VendorPurchase"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "PointIssuance_transaction_id_key" ON "PointIssuance"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "Redemption_transaction_id_key" ON "Redemption"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCommission_transaction_id_key" ON "ReferralCommission"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "VendorTransfer_transaction_id_key" ON "VendorTransfer"("transaction_id");

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_correspondent_id_fkey" FOREIGN KEY ("correspondent_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPurchase" ADD CONSTRAINT "VendorPurchase_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "TransactionLedger"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPurchase" ADD CONSTRAINT "VendorPurchase_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointIssuance" ADD CONSTRAINT "PointIssuance_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "TransactionLedger"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointIssuance" ADD CONSTRAINT "PointIssuance_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointIssuance" ADD CONSTRAINT "PointIssuance_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "TransactionLedger"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "TransactionLedger"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorTransfer" ADD CONSTRAINT "VendorTransfer_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "TransactionLedger"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorTransfer" ADD CONSTRAINT "VendorTransfer_sender_vendor_id_fkey" FOREIGN KEY ("sender_vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorTransfer" ADD CONSTRAINT "VendorTransfer_receiver_vendor_id_fkey" FOREIGN KEY ("receiver_vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
