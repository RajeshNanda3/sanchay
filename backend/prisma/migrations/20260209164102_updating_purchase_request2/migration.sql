/*
  Warnings:

  - You are about to alter the column `points` on the `PurchaseRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "PurchaseRequest" ALTER COLUMN "points" SET DATA TYPE INTEGER;
