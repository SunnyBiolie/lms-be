/*
  Warnings:

  - You are about to drop the column `bookName` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `renewedAt` on the `History` table. All the data in the column will be lost.
  - Added the required column `bookTitle` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnedAt` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "bookName",
DROP COLUMN "renewedAt",
ADD COLUMN     "bookTitle" TEXT NOT NULL,
ADD COLUMN     "borrowedAt" TIMESTAMP(3)[],
ADD COLUMN     "returnedAt" TIMESTAMP(3) NOT NULL;
