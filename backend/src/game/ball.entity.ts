import { Logger } from '@nestjs/common';
import * as Victor from 'victor';

import { GameModeConfig } from './game-modes.entity';
import { Game } from './game.entity';
import { Player } from './player.entity';

export class Ball {
  private readonly gameMode: GameModeConfig;
  private game: Game;
  private players: Array<Player>;
  private pos = { x: 0, y: 0 };
  private dir = new Victor(0, 0);
  private roundStart = new Date();

  constructor(gameMode: GameModeConfig, players: Array<Player>) {
    this.gameMode = gameMode;
    this.players = players;
  }

  getPos() {
    return this.pos;
  }

  newBall() {
    this.roundStart = new Date();
    this.pos.x = this.gameMode.GAME_WIDTH / 2 - this.gameMode.BALL_DIAMETER / 2;
    this.pos.y =
      this.gameMode.GAME_HEIGHT / 2 - this.gameMode.BALL_DIAMETER / 2;

    this.dir.x =
      (Math.floor(Math.random() * 21) - 10) / (10 / this.gameMode.BALL_SPEED);
    if (
      this.dir.x === 0 ||
      this.dir.x === this.gameMode.BALL_SPEED ||
      this.dir.x === -this.gameMode.BALL_SPEED
    )
      this.dir.x = this.gameMode.BALL_SPEED * 0.9;
    if (this.dir.x < this.gameMode.BALL_SPEED * 0.7 && this.dir.x > 0)
      this.dir.x = this.gameMode.BALL_SPEED * 0.7;
    if (this.dir.x > -(this.gameMode.BALL_SPEED * 0.7) && this.dir.x < 0)
      this.dir.x = -(this.gameMode.BALL_SPEED * 0.7);
    this.dir.y = Math.sqrt(
      this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED -
        this.dir.x * this.dir.x,
    );
    const rend: number = Math.floor(Math.random() * 2.1) - 1;
    if (rend < 0) this.dir.y = -this.dir.y;
  }

  checkpaddle() {
    let paddlePos: number;
    const collisionBox: number =
      this.gameMode.PADDLE_SIZE + this.gameMode.PADDLE_COLLISION_EXTENSION;

    if (this.pos.x < this.gameMode.PADDLE_DISTANCE_FROM_BORDER) {
      paddlePos = this.players[0].getY();
    } else paddlePos = this.players[1].getY();

    if (
      this.pos.y >= paddlePos + collisionBox ||
      this.pos.y <= paddlePos - this.gameMode.BALL_DIAMETER
    )
      return -this.gameMode.BALL_SPEED;
    else if (
      this.pos.y > paddlePos + collisionBox / 3 &&
      this.pos.y < paddlePos + collisionBox / 2
    )
      return 0;
    else if (
      this.pos.y >= paddlePos + collisionBox / 6 &&
      this.pos.y < paddlePos + collisionBox / 3
    )
      return -Math.sin(Math.PI / 6) * this.gameMode.BALL_SPEED; // 30deg = pi/6
    else if (
      this.pos.y >= paddlePos + collisionBox / 2 &&
      this.pos.y < paddlePos + (collisionBox * 2) / 3
    )
      return Math.sin(Math.PI / 6) * this.gameMode.BALL_SPEED; // 30deg = pi/6
    else if (
      this.pos.y >= paddlePos &&
      this.pos.y < paddlePos + collisionBox / 6
    )
      return -Math.sin(Math.PI / 3) * this.gameMode.BALL_SPEED; // 60deg = pi/3
    else if (
      this.pos.y >= paddlePos + (collisionBox * 2) / 3 &&
      this.pos.y < paddlePos + (collisionBox * 5) / 6
    )
      return Math.sin(Math.PI / 3) * this.gameMode.BALL_SPEED; // 60deg = pi/3
    //TODO: check d'ou vient la valeur 20
    else if (this.pos.y >= paddlePos - 20 && this.pos.y < paddlePos)
      return -Math.sin(Math.PI / 2.3) * this.gameMode.BALL_SPEED; //~86deg
    else if (
      this.pos.y >= paddlePos + (collisionBox * 5) / 6 &&
      this.pos.y < paddlePos + collisionBox
    )
      return Math.sin(Math.PI / 2.3) * this.gameMode.BALL_SPEED; //~86deg
    else return -this.gameMode.BALL_SPEED;
  }

  move() {
    if (
      new Date().getTime() - this.gameMode.BALL_START_ROUND_WAIT * 1000 <
      this.roundStart.getTime()
    )
      return;
    this.pos.x += Math.round(this.dir.x * this.gameMode.BALL_SPEED);
    this.pos.y += Math.round(this.dir.y * this.gameMode.BALL_SPEED);
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.dir.y *= -1;
    } else if (
      this.pos.y >
      this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER
    ) {
      this.pos.y = this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER;
      this.dir.y *= -1;
    }
    if (
      this.pos.x < this.gameMode.PADDLE_DISTANCE_FROM_BORDER ||
      this.pos.x >
        this.gameMode.GAME_WIDTH -
          this.gameMode.BALL_DIAMETER -
          this.gameMode.PADDLE_DISTANCE_FROM_BORDER
    ) {
      const tmp = this.checkpaddle();
      if (tmp != -this.gameMode.BALL_SPEED) {
        this.dir.y = tmp;
        if (this.dir.x < 0)
          this.dir.x = Math.sqrt(
            this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED -
              this.dir.y * this.dir.y,
          );
        else
          this.dir.x = -Math.sqrt(
            this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED -
              this.dir.y * this.dir.y,
          );
        if (this.pos.x < this.gameMode.PADDLE_DISTANCE_FROM_BORDER)
          this.pos.x = this.gameMode.PADDLE_DISTANCE_FROM_BORDER;
        if (
          this.pos.x >
          this.gameMode.GAME_WIDTH -
            this.gameMode.BALL_DIAMETER -
            this.gameMode.PADDLE_DISTANCE_FROM_BORDER
        )
          this.pos.x =
            this.gameMode.GAME_WIDTH -
            this.gameMode.BALL_DIAMETER -
            this.gameMode.PADDLE_DISTANCE_FROM_BORDER;
        return 0;
      } else {
        return 1;
      }
    }
    return 0;
  }

  toString() {
    return `\tx: ${this.pos.x}\n` + `\ty: ${this.pos.y}\n`;
  }
}
