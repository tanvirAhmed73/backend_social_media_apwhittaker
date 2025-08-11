-- DropForeignKey
ALTER TABLE "public"."ucodes" DROP CONSTRAINT "ucodes_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ucodes" ADD CONSTRAINT "ucodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
