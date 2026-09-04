/*
  Warnings:

  - The values [PRO] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('FREE', 'MONTHLY', 'HALF_YEARLY', 'YEARLY');
ALTER TABLE "public"."user" ALTER COLUMN "subscriptionPlan" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "subscriptionPlan" TYPE "SubscriptionPlan_new" USING ("subscriptionPlan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "user" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'FREE';
COMMIT;
