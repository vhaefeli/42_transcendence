/*
  Warnings:

  - You are about to drop the column `twoFA_enabled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "twoFA_enabled",
ADD COLUMN     "tfa_email_address" TEXT,
ADD COLUMN     "tfa_enabled" BOOLEAN NOT NULL DEFAULT false;
