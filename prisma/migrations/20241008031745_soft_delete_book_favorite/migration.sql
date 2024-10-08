/*
  Warnings:

  - You are about to drop the column `upToMember` on the `Report` table. All the data in the column will be lost.
  - Added the required column `reportId` to the `MembershipLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MembershipLog" ADD COLUMN     "reportId" TEXT NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "upToMember";

-- CreateTable
CREATE TABLE "_AccountToBook" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToBook_AB_unique" ON "_AccountToBook"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToBook_B_index" ON "_AccountToBook"("B");

-- AddForeignKey
ALTER TABLE "MembershipLog" ADD CONSTRAINT "MembershipLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBook" ADD CONSTRAINT "_AccountToBook_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBook" ADD CONSTRAINT "_AccountToBook_B_fkey" FOREIGN KEY ("B") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
