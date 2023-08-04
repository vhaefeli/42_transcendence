import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game } from './game.entity';
import { ConnectedPlayers, PlayerAction } from './player.entity';
import { WsException } from '@nestjs/websockets';
import { game_status } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService {
  private readonly frame_time = 10 + 2 / 3;
  private games = new Map<number, Game>();

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => GameGateway))
    private gameGateway: GameGateway,
  ) {
    setInterval(this.gameLoop.bind(this), this.frame_time);
    this.onStartEndRunningGames();
  }

  private async onStartEndRunningGames() {
    // If any games where ongoing and the server restarted
    // set those games as completed and canceled
    await this.prisma.game.updateMany({
      where: {
        completed: false,
        player: { every: { gameStatus: game_status.PLAYING } },
      },
      data: {
        completed: true,
      },
    });
    await this.prisma.player.updateMany({
      where: { gameStatus: game_status.PLAYING },
      data: {
        gameStatus: game_status.ENDED,
        score4stat: false,
      },
    });
  }

  findGame(gameId: number): Game | undefined {
    return this.games.get(gameId);
  }

  findOrCreateGame(gameId: number): Game {
    let game = this.games.get(gameId);
    if (game === undefined) {
      game = new Game({ id: gameId }, this.gameGateway, this.prisma);
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
      throw new WsException('Game not found or unavailable to connect, perhaps the opponent left');
    const game = this.findOrCreateGame(gameId);
    game.connectPlayer(userId, socket);
  }

  async playerIsReadyToStart(gameId: number, userId: number) {
    if (ConnectedPlayers.get(userId) !== gameId)
      throw new WsException("Game id doesn't match the connected game");
    this.findGame(gameId).playerIsReadyToStart(userId);
  }

  private async gameLoop() {
    const running_games = new Array<Promise<void>>();

    this.games.forEach((game) => {
      if (game.getHasEnded()) this.games.delete(game.id);
      else running_games.push(game.loop());
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
