/*
  Warnings:

  - Added the required column `isSpecial` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedFrom` to the `History` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `borrowedAt` on the `History` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "isSpecial" BOOLEAN NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "History" ADD COLUMN     "categoriesId" TEXT[],
ADD COLUMN     "categoriesName" TEXT[],
ADD COLUMN     "passedFor" TEXT,
ADD COLUMN     "receivedFrom" TEXT NOT NULL,
ADD COLUMN     "renewedAt" TIMESTAMP(3)[],
DROP COLUMN "borrowedAt",
ADD COLUMN     "borrowedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "passedFor" TEXT,
ADD COLUMN     "receivedFrom" TEXT,
ALTER COLUMN "dueDate" DROP NOT NULL,
ALTER COLUMN "borrowedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rp_Account" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "borrowCount" INTEGER NOT NULL,
    "overdueCount" INTEGER NOT NULL,
    "isViewedByUser" BOOLEAN NOT NULL,

    CONSTRAINT "Rp_Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rp_Book" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "borrowedCount" INTEGER NOT NULL,

    CONSTRAINT "Rp_Book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rp_Account" ADD CONSTRAINT "Rp_Account_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rp_Account" ADD CONSTRAINT "Rp_Account_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rp_Book" ADD CONSTRAINT "Rp_Book_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rp_Book" ADD CONSTRAINT "Rp_Book_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
