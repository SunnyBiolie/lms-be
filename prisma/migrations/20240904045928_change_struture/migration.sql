/*
  Warnings:

  - You are about to drop the `Borrowing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Renewal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Returned` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Borrowing" DROP CONSTRAINT "Borrowing_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Borrowing" DROP CONSTRAINT "Borrowing_bookId_fkey";

-- DropTable
DROP TABLE "Borrowing";

-- DropTable
DROP TABLE "Renewal";

-- DropTable
DROP TABLE "Returned";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "borrowedAt" TIMESTAMP(3)[],
    "dueDates" TIMESTAMP(3)[],
    "returnedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "bookName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "renewedAt" TIMESTAMP(3)[],
    "dueDates" TIMESTAMP(3)[],
    "accountId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
