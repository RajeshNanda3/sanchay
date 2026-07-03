-- AlterTable
ALTER TABLE "OfferRecipient" ADD COLUMN     "vendor_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vendor_read_at" TIMESTAMP(3);
