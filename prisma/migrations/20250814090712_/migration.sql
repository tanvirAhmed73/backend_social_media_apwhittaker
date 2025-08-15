/*
  Warnings:

  - A unique constraint covering the columns `[interestItem]` on the table `Interest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "public"."Images" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imagefile" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interest_interestItem_key" ON "public"."Interest"("interestItem");

-- AddForeignKey
ALTER TABLE "public"."Images" ADD CONSTRAINT "Images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
