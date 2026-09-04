/*
  Warnings:

  - You are about to drop the column `transactionId` on the `subscription` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "subscription_transactionId_key";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "transactionId";
