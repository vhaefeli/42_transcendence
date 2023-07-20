import { GameModeConfig } from './game-modes.entity';

export class Ball {
  private readonly gameMode: GameModeConfig;
  private pos: { x: number; y: number };

  constructor(gameMode: GameModeConfig) {
    this.gameMode = gameMode;
    this.pos.x = (gameMode.GAME_WIDTH - gameMode.BALL_DIAMETER) / 2;
    this.pos.y = (gameMode.GAME_HEIGHT - gameMode.BALL_DIAMETER) / 2;
  }

  getPos() {
    return this.pos;
  }
}
