import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { game_status } from '@prisma/client';
import { Socket } from 'socket.io';

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
};

export class Game {
  readonly id: number;
  readonly gameModeName: GameModeType;
  private readonly gameMode: GameModeConfig;
  private readonly p = new Array<Player>(2);
  private status: game_status;

  constructor(gameInfo: { id: number; gameMode?: GameModeType }) {
    this.id = gameInfo.id;
    this.status = game_status.WAITING;

    if (gameInfo.gameMode === undefined) {
      this.gameModeName = GameModeType.NORMAL;
      this.gameMode = GameModeList.get(this.gameModeName);
    } else if (
      (this.gameMode = GameModeList.get(gameInfo.gameMode)) !== undefined
    )
      this.gameModeName = gameInfo.gameMode;
    else throw new TypeError(`Game Mode '${gameInfo.gameMode}' is unknown`);
  }

  getStatus(): game_status {
    return this.status;
  }

  connectPlayer(id: number, socket: Socket) {
    if (this.status !== game_status.WAITING)
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
    };
    if (playerIndex === 1) this.startGame();
  }

  startGame() {
    // TODO: mark game as started
    this.status = game_status.PLAYING;
  }

  updatePlayerAction(userId: number, action: PlayerAction): boolean {
    if (!(this.status === game_status.PLAYING))
      throw new WsException("Game hasn't started yet");
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
    if (this.status === game_status.PLAYING) {
      if (!this.handlePlayerDisconnection()) {
        // TODO mark game as ended player abandoned
        this.status = game_status.ENDED;
        Logger.log(`A player got disconnected, game is over`);
        return;
      }
      // game is ok
    }
  }

  printGameInfo() {
    Logger.debug(
      `\nid: ${this.id}\nmode: ${this.gameModeName}\nstatus: ${this.status}` +
        `\nPlayers:\n\t` +
        (this.p[0] !== undefined
          ? `id: ${this.p[0].id}\n\ty: ${this.p[0].y}\n\taction: ${this.p[0].action}\n\tscore: ${this.p[0].score}\n\tsocket: ${this.p[0].socket?.id}`
          : 'not connected') +
        '\n\n\t' +
        (this.p[1] !== undefined
          ? `id: ${this.p[1].id}\n\ty: ${this.p[1].y}\n\taction: ${this.p[1].action}\n\tscore: ${this.p[1].score}\n\tsocket: ${this.p[1].socket?.id}`
          : 'not connected'),
    );
  }
}
