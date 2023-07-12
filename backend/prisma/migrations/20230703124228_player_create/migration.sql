-- CreateEnum
CREATE TYPE "mode_type" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- CreateEnum
CREATE TYPE "game_status" AS ENUM ('WAITING', 'PLAYING', 'ENDED');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "seq" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "mode" "mode_type" NOT NULL DEFAULT 'BEGINNER',
    "gameStatus" "game_status" NOT NULL DEFAULT 'WAITING',
    "score" INTEGER NOT NULL DEFAULT 0,
    "abandon" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameId_playerId_key" ON "Player"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
