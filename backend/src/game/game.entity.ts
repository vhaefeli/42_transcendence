import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { GameGateway } from './game.gateway';
import { game_status } from '@prisma/client';

export enum GameModeType {
  NORMAL = 'NORMAL',
}

type GameModeConfig = {
  INITIAL_HEIGHT: number;
};

export const GameModeList = new Map<GameModeType, GameModeConfig>();
GameModeList.set(GameModeType.NORMAL, {
  INITIAL_HEIGHT: 300,
});

export enum PlayerAction {
  IDLE,
  UP,
  DOWN,
}

export const ConnectedPlayers = new Map<number, number>();

type Player = {
  id: number;
  y: number;
  action: PlayerAction;
  score: number;
  socket: Socket;
  isReady: boolean;
  abandoned: boolean;
};

export class Game {
  readonly id: number;
  readonly gameModeName: GameModeType;
  private readonly gameMode: GameModeConfig;
  private readonly p = new Array<Player>(2);
  private isActive = false;
  private isCompleted = false;

  constructor(
    gameInfo: { id: number; gameMode?: GameModeType },
    private gameGateway: GameGateway,
    private prisma: PrismaService,
  ) {
    this.id = gameInfo.id;
    if (gameInfo.gameMode === undefined) {
      this.gameModeName = GameModeType.NORMAL;
      this.gameMode = GameModeList.get(this.gameModeName);
    } else if (
      (this.gameMode = GameModeList.get(gameInfo.gameMode)) !== undefined
    )
      this.gameModeName = gameInfo.gameMode;
    else throw new TypeError(`Game Mode '${gameInfo.gameMode}' is unknown`);
  }

  getIsActive() {
    return this.isActive;
  }

  connectPlayer(id: number, socket: Socket) {
    if (this.isActive || this.isCompleted)
      throw new WsException(
        'Trying to connect to game that has already started or ended',
      );
    let playerIndex = -1;
    if (this.p[0] === undefined) playerIndex = 0;
    else if (this.p[1] === undefined) playerIndex = 1;
    else return;
    if (ConnectedPlayers.has(id))
      throw new WsException('User is already connected to a game');
    ConnectedPlayers.set(id, this.id);
    this.p[playerIndex] = {
      id: id,
      y: this.gameMode.INITIAL_HEIGHT,
      action: PlayerAction.IDLE,
      score: 0,
      socket: socket,
      isReady: false,
      abandoned: false,
    };
    socket.join(this.id.toString());
  }

  playerIsReadyToStart(userId: number) {
    this.p.find((player) => player.id === userId).isReady = true;
    if (this.p.filter((player) => player.isReady).length === 2) {
      this.startGame();
    }
  }

  async sendScoreToPlayers() {
    const msg = [
      { id: this.p[0].id, score: this.p[0].score },
      { id: this.p[1].id, score: this.p[1].score },
    ];
    this.gameGateway.server.to(this.id.toString()).emit('score', msg);
  }

  updatePlayerAction(userId: number, action: PlayerAction): boolean {
    if (!this.isActive) throw new WsException("Game isn't active");
    const player = this.p.find((player) => player.id === userId);
    if (player === undefined)
      throw new WsException("Player isn't connected to game");
    player.action = action;
    return true;
  }

  private detectPlayerDisconnection(): boolean {
    if (this.p[0] && !this.p[0]?.socket.connected) {
      this.p[0].abandoned = true;
      return false;
    }
    if (this.p[1] && !this.p[1]?.socket.connected) {
      this.p[1].abandoned = true;
      return false;
    }
    return true;
  }

  private async handlePlayerDisconnection() {
    if (!this.detectPlayerDisconnection()) {
      if (this.isActive || !this.isCompleted) {
        await this.endGame(this.isActive);
      }
    }
  }

  async loop() {
    this.printGameInfo();
    await this.handlePlayerDisconnection();
    if (this.isActive) {
      // game loop goes here
    }
  }

  private async startGame() {
    await this.prisma.player.updateMany({
      where: {
        gameId: this.id,
        gameStatus: game_status.WAITING,
      },
      data: { gameStatus: game_status.PLAYING },
    });
    this.isActive = true;
    this.sendScoreToPlayers();
  }

  async endGame(wasCompleted: boolean) {
    this.isActive = false;
    this.isCompleted = true;
    this.informGameIsOver();
    const promises = new Array<Promise<any>>();
    if (wasCompleted) promises.push(this.completeGame());
    else promises.push(this.cancelGame());
    this.p.forEach((player) => promises.push(this.userEndGame(player)));
    await Promise.all(promises);
  }

  private async completeGame() {
    await this.prisma.game.update({
      where: { id: this.id },
      data: { completed: true },
    });

    const onePlayerAbandoned = this.p.filter(
      (player) => player.abandoned,
    ).length;

    const promises = new Array<Promise<any>>();
    this.p.forEach((player) => {
      promises.push(
        this.prisma.player.update({
          where: {
            gameId_playerId: { gameId: this.id, playerId: player.id },
          },
          data: {
            // if none of the players have abandoned the match, add the game score
            // else if this player is the on that abandoned the match, add score 0
            // else add score 3 because the other player has abandoned the match
            score: !onePlayerAbandoned
              ? player.score
              : player.abandoned
              ? 0
              : 3,
            abandon: player.abandoned,
            score4stat: true,
            gameStatus: game_status.ENDED,
          },
        }),
      );
    });
    await Promise.all(promises);
  }

  private async cancelGame() {
    await this.prisma.game.update({
      where: {
        id: this.id,
      },
      data: {
        player: {
          updateMany: {
            where: { gameId: this.id },
            data: {
              gameStatus: game_status.ENDED,
              score: 0,
              abandon: false,
              score4stat: false,
            },
          },
        },
        completed: true,
      },
    });
  }

  private async informGameIsOver() {
    this.gameGateway.server.to(this.id.toString()).emit('gameIsOver');
  }

  private async userEndGame(player: Player) {
    if (player === undefined) return;
    ConnectedPlayers.delete(player.id);
    player.socket.leave(this.id.toString());
    player.isReady = false;
  }

  printGameInfo() {
    Logger.debug(
      `\nid: ${this.id}\nmode: ${this.gameModeName}\nisActive: ${this.isActive}` +
        `\nPlayers:\n\t` +
        (this.p[0] !== undefined
          ? `id: ${this.p[0].id}\n\ty: ${this.p[0].y}\n\taction: ${this.p[0].action}\n\tscore: ${this.p[0].score}\n\tsocket: ${this.p[0].socket?.id}\n\tisReady: ${this.p[0].isReady}\n\tabandoned: ${this.p[0].abandoned}`
          : 'not connected') +
        '\n\n\t' +
        (this.p[1] !== undefined
          ? `id: ${this.p[1].id}\n\ty: ${this.p[1].y}\n\taction: ${this.p[1].action}\n\tscore: ${this.p[1].score}\n\tsocket: ${this.p[1].socket?.id}\n\tisReady: ${this.p[1].isReady}\n\tabandoned: ${this.p[1].abandoned}`
          : 'not connected'),
    );
  }
}
