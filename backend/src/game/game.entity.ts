import { Logger } from '@nestjs/common';
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

type Player = {
  id: number;
  y: number;
  action: PlayerAction;
  score: number;
  socket?: Socket;
};

export class Game {
  readonly id: number;
  readonly gameModeName: GameModeType;
  readonly gameMode: GameModeConfig;
  p = new Array<Player>(2);

  constructor(gameInfo: {
    id: number;
    gameMode?: GameModeType;
    players: [{ id: number }, { id: number }];
  }) {
    this.id = gameInfo.id;

    if (gameInfo.gameMode === undefined) {
      this.gameModeName = GameModeType.NORMAL;
      this.gameMode = GameModeList.get(this.gameModeName);
    } else if (
      (this.gameMode = GameModeList.get(gameInfo.gameMode)) !== undefined
    )
      this.gameModeName = gameInfo.gameMode;
    else throw new TypeError(`Game Mode '${gameInfo.gameMode}' is unknown`);

    this.p[0] = {
      id: gameInfo.players[0].id,
      y: this.gameMode.INITIAL_HEIGHT,
      action: PlayerAction.IDLE,
      score: 0,
    };
    this.p[1] = {
      id: gameInfo.players[1].id,
      y: this.gameMode.INITIAL_HEIGHT,
      action: PlayerAction.IDLE,
      score: 0,
    };
  }

  async loop() {
    this.printGameInfo();
  }

  printGameInfo() {
    Logger.debug(
      `\nGame id: ${this.id}\nGame mode: ${this.gameModeName}` +
        `\nPlayers:` +
        `\n\tid: ${this.p[0].id}\n\ty: ${this.p[0].y}\n\taction: ${this.p[0].action}\n\tscore: ${this.p[0].score}\n\tsocket: ${this.p[0].socket?.id}` +
        `\n\n\tid: ${this.p[1].id}\n\ty: ${this.p[1].y}\n\taction: ${this.p[1].action}\n\tscore: ${this.p[1].score}\n\tsocket: ${this.p[1].socket?.id}`,
    );
  }
}
