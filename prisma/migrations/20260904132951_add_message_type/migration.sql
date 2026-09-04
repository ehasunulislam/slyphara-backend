-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE');

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'TEXT';
