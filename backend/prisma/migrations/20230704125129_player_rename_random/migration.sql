/*
  Warnings:

  - You are about to drop the column `random` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "random",
ADD COLUMN     "randomAssignation" BOOLEAN NOT NULL DEFAULT false;
