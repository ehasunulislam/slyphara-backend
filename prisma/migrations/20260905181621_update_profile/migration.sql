-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "institutionName" TEXT,
ADD COLUMN     "isStudentVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studentIdCardNumber" TEXT;
