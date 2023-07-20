import { Logger } from '@nestjs/common';
import { GameModeConfig } from './game-modes.entity';
import * as Victor from 'victor';

export class Ball {
  private readonly gameMode: GameModeConfig;
  private pos: { x: number; y: number };
  private dir = new Victor(0, 0);

  constructor(gameMode: GameModeConfig) {
    this.gameMode = gameMode;
    this.pos = {
      x: (gameMode.GAME_WIDTH - gameMode.BALL_DIAMETER) / 2,
      y: (gameMode.GAME_HEIGHT - gameMode.BALL_DIAMETER) / 2,
    };
  }

  getPos() {
    return this.pos;
  }

  move() {
    // ** TEST **
    // set a random direction vector to ball
    const v = new Victor(Math.random() - 0.5, Math.random() - 0.5);
    v.normalize();
    this.dir.mix(v, 0.2);
    // ** END TEST **

    // move the ball
    this.dir.normalize();
    this.pos.x += Math.floor(this.dir.x * this.gameMode.BALL_SPEED);
    this.pos.y += Math.floor(this.dir.y * this.gameMode.BALL_SPEED);
    if (this.pos.y < 0) this.pos.y = 0;
    else if (
      this.pos.y >
      this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER
    )
      this.pos.y = this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER;
    if (this.pos.x < 0) this.pos.x = 0;
    else if (
      this.pos.x >
      this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER
    )
      this.pos.x = this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER;
  }

  toString() {
    return `\tx: ${this.pos.x}\n` + `\ty: ${this.pos.y}\n`;
  }
}
