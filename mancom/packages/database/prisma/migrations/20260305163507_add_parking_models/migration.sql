/*
  Warnings:

  - You are about to drop the column `scannedByEntry` on the `parking_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `scannedByExit` on the `parking_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parking_sessions" DROP COLUMN "scannedByEntry",
DROP COLUMN "scannedByExit",
ADD COLUMN     "scannedByEntryId" TEXT,
ADD COLUMN     "scannedByExitId" TEXT;

-- CreateTable
CREATE TABLE "parking_qr_codes" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "codeData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parking_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violation_logs" (
    "id" TEXT NOT NULL,
    "securityUserId" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "ownerName" TEXT,
    "phoneNumber" TEXT,
    "issueType" TEXT,
    "messageSent" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "parking_qr_codes_token_key" ON "parking_qr_codes"("token");

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_scannedByEntryId_fkey" FOREIGN KEY ("scannedByEntryId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_sessions" ADD CONSTRAINT "parking_sessions_scannedByExitId_fkey" FOREIGN KEY ("scannedByExitId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_qr_codes" ADD CONSTRAINT "parking_qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violation_logs" ADD CONSTRAINT "violation_logs_securityUserId_fkey" FOREIGN KEY ("securityUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
