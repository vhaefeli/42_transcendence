-- CreateEnum
CREATE TYPE "status_type" AS ENUM ('ONLINE', 'OFFLINE', 'INGAME');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "status_type" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "twoFA_enabled" BOOLEAN NOT NULL DEFAULT false;
