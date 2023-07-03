/*
  Warnings:

  - You are about to drop the column `twoFA_enabled` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TfaRegistrationType" AS ENUM ('ENABLE', 'DISABLE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "twoFA_enabled",
ADD COLUMN     "tfa_email_address" TEXT,
ADD COLUMN     "tfa_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TfaRegistration" (
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TfaRegistrationType" NOT NULL DEFAULT 'ENABLE',

    CONSTRAINT "TfaRegistration_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "TfaRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TfaRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TfaRegistration" ADD CONSTRAINT "TfaRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TfaRequest" ADD CONSTRAINT "TfaRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
