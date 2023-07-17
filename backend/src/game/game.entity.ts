import { Inject, Logger, forwardRef } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { PrismaService } from 'src/prisma.service';

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
};

export class Game {
  readonly id: number;
  readonly gameModeName: GameModeType;
  private readonly gameMode: GameModeConfig;
  private readonly p = new Array<Player>(2);
  private isActive = false;

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
    if (this.isActive)
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
    };
    socket.join(this.id.toString());
  }

  playerIsReadyToStart(userId: number) {
    this.p.find((player) => player.id === userId).isReady = true;
    if (this.p.filter((player) => player.isReady).length === 2) {
      this.startGame();
    }
  }

  async startGame() {
    // TODO: mark game as started
    this.isActive = true;
    this.sendScoreToPlayers();
  }

  async sendScoreToPlayers() {
    const msg = [
      { id: this.p[0].id, score: this.p[0].score },
      { id: this.p[1].id, score: this.p[1].score },
    ];
    this.gameGateway.server.to(this.id.toString()).emit('score', msg);
  }

  updatePlayerAction(userId: number, action: PlayerAction): boolean {
    if (!this.isActive) throw new WsException("Game hasn't started yet");
    const player = this.p.find((player) => player.id === userId);
    if (player === undefined)
      throw new WsException("Player isn't connected to game");
    player.action = action;
    return true;
  }

  handlePlayerDisconnection(): boolean {
    let allConnected = true;
    if (!this.p[0]?.socket.connected) {
      allConnected = false;
      ConnectedPlayers.delete(this.p[0].id);
      this.p[0] = undefined;
    }
    if (!this.p[1]?.socket.connected) {
      allConnected = false;
      ConnectedPlayers.delete(this.p[1].id);
      this.p[1] = undefined;
    }
    return allConnected;
  }

  async loop() {
    this.printGameInfo();
    if (this.isActive) {
      if (!this.handlePlayerDisconnection()) {
        // TODO mark game as ended player abandoned
        this.isActive = false;
        Logger.log(`A player got disconnected, game is over`);
        return;
      }
      // game is ok
    }
  }

  printGameInfo() {
    Logger.debug(
      `\nid: ${this.id}\nmode: ${this.gameModeName}\nisActive: ${this.isActive}` +
        `\nPlayers:\n\t` +
        (this.p[0] !== undefined
          ? `id: ${this.p[0].id}\n\ty: ${this.p[0].y}\n\taction: ${this.p[0].action}\n\tscore: ${this.p[0].score}\n\tsocket: ${this.p[0].socket?.id}\n\tisReady: ${this.p[0].isReady}`
          : 'not connected') +
        '\n\n\t' +
        (this.p[1] !== undefined
          ? `id: ${this.p[1].id}\n\ty: ${this.p[1].y}\n\taction: ${this.p[1].action}\n\tscore: ${this.p[1].score}\n\tsocket: ${this.p[1].socket?.id}\n\tisReady: ${this.p[1].isReady}`
          : 'not connected'),
    );
  }
}
