-- DropForeignKey
ALTER TABLE "FileCategories" DROP CONSTRAINT "FileCategories_fileId_fkey";

-- AddForeignKey
ALTER TABLE "FileCategories" ADD CONSTRAINT "FileCategories_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
