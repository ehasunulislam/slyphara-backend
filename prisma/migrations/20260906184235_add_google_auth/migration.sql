/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AuthProvider" ADD VALUE 'CREDENTIAL';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIAL',
ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");
