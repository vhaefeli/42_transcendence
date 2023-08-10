import { Logger } from '@nestjs/common';
import * as Victor from 'victor';

import { GameModeConfig } from './game-modes.entity';
import { Game } from './game.entity';
import { Player } from './player.entity';
import { log } from 'console';

export class Ball {
  private readonly gameMode: GameModeConfig;
  private game: Game;
  private players: Array<Player>;
  private pos = { x: 0, y: 0 };
  private dir = new Victor(0, 0);
  private roundStart = new Date();
  private side = 0;

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
    if (this.dir.x < 0) this.side--;
    if (this.dir.x > 0) this.side++;
    if (this.side == 2 || this.side == -2) {
      this.dir.x = -this.dir.x;
      this.side = 0;
    }
    this.dir.y = Math.sqrt(
      this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED -
        this.dir.x * this.dir.x,
    );
    const rend: number = Math.floor(Math.random() * 2.1) - 1;
    if (rend < 0) this.dir.y = -this.dir.y;
  }

  checkpaddle() {
    let paddlePos: number;
    // const collisionBox: number =
    //   this.gameMode.PADDLE_SIZE + this.gameMode.PADDLE_COLLISION_EXTENSION;
    let range: number;
    let minPos: number;
    let maxPos: number;
    let midPos: number;
    let slope: number;

    if (this.pos.x < this.gameMode.PADDLE_DISTANCE_FROM_BORDER) {
      paddlePos = this.players[0].getY();
    } else paddlePos = this.players[1].getY();

    //console.log(`paddle pos ${paddlePos} y ${this.pos.y}`);

    minPos =
      paddlePos -
      this.gameMode.PADDLE_COLLISION_EXTENSION / 2 -
      this.gameMode.BALL_DIAMETER;
    maxPos =
      paddlePos +
      this.gameMode.PADDLE_SIZE +
      this.gameMode.PADDLE_COLLISION_EXTENSION / 2;

    //console.log(`minpos ${minPos} maxpos ${maxPos}`);
    if (this.pos.y >= maxPos || this.pos.y <= minPos)
      return -this.gameMode.BALL_SPEED;

    range =
      this.gameMode.PADDLE_SIZE +
      this.gameMode.PADDLE_COLLISION_EXTENSION +
      this.gameMode.BALL_DIAMETER;

    midPos = (minPos + maxPos) / 2;

    slope = (-Math.sin(Math.PI / 2.25) * this.gameMode.BALL_SPEED * 2) / range;

    return (midPos - this.pos.y) * slope;
    // else if (
    //   this.pos.y > paddlePos + collisionBox / 3 &&
    //   this.pos.y < paddlePos + collisionBox / 2
    // )
    //   return 0;
    // else if (
    //   this.pos.y >= paddlePos + collisionBox / 6 &&
    //   this.pos.y < paddlePos + collisionBox / 3
    // )
    //   return -Math.sin(Math.PI / 6) * this.gameMode.BALL_SPEED; // 30deg = pi/6
    // else if (
    //   this.pos.y >= paddlePos + collisionBox / 2 &&
    //   this.pos.y < paddlePos + (collisionBox * 2) / 3
    // )
    //   return Math.sin(Math.PI / 6) * this.gameMode.BALL_SPEED; // 30deg = pi/6
    // else if (
    //   this.pos.y >= paddlePos &&
    //   this.pos.y < paddlePos + collisionBox / 6
    // )
    //   return -Math.sin(Math.PI / 3) * this.gameMode.BALL_SPEED; // 60deg = pi/3
    // else if (
    //   this.pos.y >= paddlePos + (collisionBox * 2) / 3 &&
    //   this.pos.y < paddlePos + (collisionBox * 5) / 6
    // )
    //   return Math.sin(Math.PI / 3) * this.gameMode.BALL_SPEED; // 60deg = pi/3
    // else if (this.pos.y >= paddlePos - collisionBox && this.pos.y < paddlePos)
    //   return -Math.sin(Math.PI / 2.4) * this.gameMode.BALL_SPEED; //~80deg
    // else if (
    //   this.pos.y >= paddlePos + (collisionBox * 5) / 6 &&
    //   this.pos.y < paddlePos + collisionBox
    // )
    //   return Math.sin(Math.PI / 2.25) * this.gameMode.BALL_SPEED; //~80deg
    // else return -this.gameMode.BALL_SPEED;
  }

  move() {
    if (
      new Date().getTime() - this.gameMode.BALL_START_ROUND_WAIT * 1000 <
      this.roundStart.getTime()
    )
      return;
    // this.pos.x += Math.round(this.dir.x * this.gameMode.BALL_SPEED);

    this.pos.x += this.dir.x * this.gameMode.BALL_SPEED;
    this.pos.y += this.dir.y * this.gameMode.BALL_SPEED;
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
        //console.log(this.dir.x);

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
