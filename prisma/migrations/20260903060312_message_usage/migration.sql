-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "message-usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message-usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message-usage_userId_createdAt_idx" ON "message-usage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "message-usage" ADD CONSTRAINT "message-usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
