-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "accountStatus" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."Ucode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ucode_pkey" PRIMARY KEY ("id")
);
