-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "upToMember" TEXT[];

-- CreateTable
CREATE TABLE "MembershipLog" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MembershipLog" ADD CONSTRAINT "MembershipLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
