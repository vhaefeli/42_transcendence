import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game, PlayerAction } from './game.entity';
import { WsException } from '@nestjs/websockets';
import { game_status } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GameService {
  //private readonly frame_time = 10 + 2 / 3;
  private readonly frame_time = 1000;
  private games = new Map<number, Game>();

  constructor(private prisma: PrismaService) {
    setInterval(this.gameLoop.bind(this), this.frame_time);
  }

  findGame(gameId: number): Game | undefined {
    return this.games.get(gameId);
  }

  findOrCreateGame(gameId: number): Game {
    let game = this.games.get(gameId);
    if (game === undefined) {
      game = new Game({ id: gameId });
      this.games.set(gameId, game);
    }
    return game;
  }

  async connectToGame(gameId: number, userId: number, socket: Socket) {
    const db_game = await this.prisma.player.findFirst({
      where: {
        gameId: gameId,
        playerId: userId,
        gameStatus: game_status.WAITING,
      },
      select: { id: true },
    });
    if (!db_game)
      throw new WsException('Game not found or unavailable to connect');
    const game = this.findOrCreateGame(gameId);
    game.connectPlayer(userId, socket);
  }

  async gameLoop() {
    const running_games = new Array<Promise<void>>();

    this.games.forEach((game) => {
      running_games.push(game.loop());
    });

    await Promise.all(running_games);
    return;
  }

  updateAction(gameId: number, userId: number, action: PlayerAction) {
    const game = this.games.get(gameId);
    if (!game) throw new WsException("Game doesn't exist");
    game.updatePlayerAction(userId, action);
  }

  getStatusOfGame(gameId: number): boolean {
    return this.findGame(gameId)?.getIsActive();
  }
}
