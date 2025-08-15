-- CreateTable
CREATE TABLE "public"."Videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videofile" TEXT NOT NULL,

    CONSTRAINT "Videos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Videos" ADD CONSTRAINT "Videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
