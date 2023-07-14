/*
  Warnings:

  - You are about to drop the column `fromId` on the `ChannelMessage` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `ChannelMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChannelMessage" DROP CONSTRAINT "ChannelMessage_fromId_fkey";

-- AlterTable
ALTER TABLE "ChannelMessage" DROP COLUMN "fromId",
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
