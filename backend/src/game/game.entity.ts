import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { GameGateway } from './game.gateway';
import { game_status } from '@prisma/client';
import { PlayerAction, Player, ConnectedPlayers } from './player.entity';
import {
  GameModeConfig,
  GameModeList,
  GameModeType,
} from './game-modes.entity';

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
    this.p[playerIndex] = new Player({
      userId: id,
      socket: socket,
      gameMode: this.gameMode,
    });
    socket.join(this.id.toString());
  }

  playerIsReadyToStart(userId: number) {
    this.p.find((player) => player.id === userId).setIsReady(true);
    if (this.p.filter((player) => player.getIsReady()).length === 2) {
      this.startGame();
    }
  }

  async sendScoreToPlayers() {
    const msg = [
      { id: this.p[0].id, score: this.p[0].getScore() },
      { id: this.p[1].id, score: this.p[1].getScore() },
    ];
    this.gameGateway.server.to(this.id.toString()).emit('score', msg);
  }

  updatePlayerAction(userId: number, action: PlayerAction): boolean {
    if (!this.isActive) throw new WsException("Game isn't active");
    const player = this.p.find((player) => player.id === userId);
    if (player === undefined)
      throw new WsException("Player isn't connected to game");
    player.setAction(action);
    return true;
  }

  private detectPlayerDisconnection(): boolean {
    if (this.p[0] && !this.p[0]?.socket.connected) {
      this.p[0].setAbandoned(true);
      return false;
    }
    if (this.p[1] && !this.p[1]?.socket.connected) {
      this.p[1].setAbandoned(true);
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
      this.p.forEach((player) => player.move());
      // TODO send game info to socket
      // TODO create ball class
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

    const onePlayerAbandoned = this.p.filter((player) =>
      player.getAbandoned(),
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
            // else if this player is the one that abandoned the match, add score 0
            // else add score 3 because the other player has abandoned the match
            score: !onePlayerAbandoned
              ? player.getScore()
              : player.getAbandoned()
              ? 0
              : 3,
            abandon: player.getAbandoned(),
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
    player.endGame();
  }

  printGameInfo() {
    Logger.debug(
      '' +
        `\nid: ${this.id}` +
        `\nmode: ${this.gameModeName}` +
        `\nisActive: ${this.isActive}` +
        `\nPlayers:\n` +
        (this.p[0] !== undefined ? this.p[0].toString() : '\tnot connected') +
        '\n\n' +
        (this.p[1] !== undefined ? this.p[1].toString() : '\tnot connected'),
    );
  }
}
