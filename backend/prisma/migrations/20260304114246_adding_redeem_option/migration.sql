-- CreateEnum
CREATE TYPE "RedeemOption" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "redeem_option" "RedeemOption" NOT NULL DEFAULT 'PENDING';
