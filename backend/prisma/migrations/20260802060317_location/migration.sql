-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location_updated_at" TIMESTAMP(3),
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location_updated_at" TIMESTAMP(3),
ADD COLUMN     "longitude" DOUBLE PRECISION;
