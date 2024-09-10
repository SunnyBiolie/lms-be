/*
  Warnings:

  - You are about to drop the column `dueDates` on the `Transaction` table. All the data in the column will be lost.
  - Changed the type of `birthDate` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `dueDate` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `borrowedAt` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "birthDate",
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "dueDates",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "borrowedAt",
ADD COLUMN     "borrowedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Renewal" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "renewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Renewal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Renewal" ADD CONSTRAINT "Renewal_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
