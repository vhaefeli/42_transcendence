-- CreateEnum
CREATE TYPE "TfaRegistrationType" AS ENUM ('ENABLE', 'DISABLE');

-- AlterTable
ALTER TABLE "TfaRegistration" ADD COLUMN     "type" "TfaRegistrationType" NOT NULL DEFAULT 'ENABLE';
