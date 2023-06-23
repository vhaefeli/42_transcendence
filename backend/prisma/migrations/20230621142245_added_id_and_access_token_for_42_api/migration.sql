/*
  Warnings:

  - A unique constraint covering the columns `[id42]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[access_token42]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "access_token42" TEXT,
ADD COLUMN     "id42" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_id42_key" ON "User"("id42");

-- CreateIndex
CREATE UNIQUE INDEX "User_access_token42_key" ON "User"("access_token42");
