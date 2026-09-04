-- CreateTable
CREATE TABLE "image_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_usage_userId_date_idx" ON "image_usage"("userId", "date");
