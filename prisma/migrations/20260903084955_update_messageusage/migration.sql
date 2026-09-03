-- DropForeignKey
ALTER TABLE "message-usage" DROP CONSTRAINT "message-usage_userId_fkey";

-- AddForeignKey
ALTER TABLE "message-usage" ADD CONSTRAINT "message-usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
