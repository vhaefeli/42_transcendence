-- CreateTable
CREATE TABLE "_channel_banned" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_channel_banned_AB_unique" ON "_channel_banned"("A", "B");

-- CreateIndex
CREATE INDEX "_channel_banned_B_index" ON "_channel_banned"("B");

-- AddForeignKey
ALTER TABLE "_channel_banned" ADD CONSTRAINT "_channel_banned_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_channel_banned" ADD CONSTRAINT "_channel_banned_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
