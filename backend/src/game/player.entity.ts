import { Socket } from 'socket.io';
import { GameModeConfig } from './game-modes.entity';

export enum PlayerAction {
  IDLE,
  UP,
  DOWN,
}

export const ConnectedPlayers = new Map<number, number>();

export class Player {
  readonly id: number;
  readonly socket: Socket;
  private y: number;
  private action: PlayerAction = PlayerAction.IDLE;
  private score = 0;
  private isReady = false;
  private abandoned = false;
  private gameEnded = false;
  private readonly gameMode: GameModeConfig;

  constructor(player: {
    userId: number;
    socket: Socket;
    gameMode: GameModeConfig;
  }) {
    this.id = player.userId;
    //this.y = player.gameMode.INITIAL_HEIGHT;
    this.y = (player.gameMode.GAME_HEIGHT - player.gameMode.PADDLE_SIZE) / 2;
    this.socket = player.socket;
    this.gameMode = player.gameMode;
  }

  setIsReady(isReady: boolean) {
    if (this.isReady === false) this.isReady = isReady;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  getScore(): number {
    return this.score;
  }

  incrementScore(): number {
    return ++this.score;
  }

  setAction(action: PlayerAction) {
    this.action = action;
  }

  getAction(): PlayerAction {
    return this.action;
  }

  setAbandoned(abandoned: boolean) {
    if (this.abandoned === false) this.abandoned = abandoned;
  }

  getAbandoned(): boolean {
    return this.abandoned;
  }

  move() {
    this.y +=
      (this.action === PlayerAction.IDLE
        ? 0
        : this.action === PlayerAction.UP
        ? -1
        : 1) * this.gameMode.PADDLE_SPEED;
    if (this.y < 0) this.y = 0;
    else if (this.y > this.gameMode.GAME_HEIGHT - this.gameMode.PADDLE_SIZE)
      this.y = this.gameMode.GAME_HEIGHT - this.gameMode.PADDLE_SIZE;
  }

  getY(): number {
    return this.y;
  }

  endGame() {
    this.isReady = false;
    this.gameEnded = true;
  }

  toString(): string {
    return (
      `\tid: ${this.id}` +
      `\n\ty: ${this.y}` +
      `\n\taction: ${this.action}` +
      `\n\tscore: ${this.score}` +
      `\n\tsocket: ${this.socket.id}` +
      `\n\tisReady: ${this.isReady}` +
      `\n\tabandoned: ${this.abandoned}`
    );
  }
}
