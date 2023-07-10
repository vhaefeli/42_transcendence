/*
  Warnings:

  - The primary key for the `DirectMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `DirectMessage` table. All the data in the column will be lost.
  - Changed the type of `date` on the `DirectMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DirectMessage" DROP CONSTRAINT "DirectMessage_pkey",
DROP COLUMN "Id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id");
