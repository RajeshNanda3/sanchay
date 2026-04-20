/*
  Warnings:

  - You are about to drop the column `age` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "age",
ADD COLUMN     "dob" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "banner" TEXT;
