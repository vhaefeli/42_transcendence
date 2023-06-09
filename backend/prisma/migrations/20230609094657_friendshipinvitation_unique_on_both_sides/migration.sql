/*
  Warnings:

  - A unique constraint covering the columns `[toId,fromId]` on the table `FriendshipInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FriendshipInvitation_toId_fromId_key" ON "FriendshipInvitation"("toId", "fromId");
