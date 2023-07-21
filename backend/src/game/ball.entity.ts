import { Logger } from '@nestjs/common';
import { GameModeConfig } from './game-modes.entity';
import * as Victor from 'victor';
import { PlayerAction, Player, ConnectedPlayers } from './player.entity';
import { Game } from './game.entity';


export class Ball {
  private readonly gameMode: GameModeConfig;
  private game: Game;
  private pos: { x: number; y: number };
  private dir = new Victor(0, 0);

  constructor(gameMode: GameModeConfig, game: Game) {
    this.gameMode = gameMode;
    this.game = game;
    // this.pos = {
    //   x: (gameMode.GAME_WIDTH - gameMode.BALL_DIAMETER) / 2,
    //   y: (gameMode.GAME_HEIGHT - gameMode.BALL_DIAMETER) / 2,
    // };
    this.newBall();
  }

  getPos() {
    return this.pos;
  }

  newBall() {
    this.pos.x = this.gameMode.GAME_WIDTH / 2 - ( this.gameMode.BALL_DIAMETER / 2 );
    this.pos.y = this.gameMode.GAME_HEIGHT / 2 - ( this.gameMode.BALL_DIAMETER / 2 );

    this.dir.x = ( Math.floor( Math.random() * 21 ) - 10 ) / ( 10 / this.gameMode.BALL_SPEED );
    if ( this.dir.x === 0 || this.dir.x === this.gameMode.BALL_SPEED || this.dir.x === - this.gameMode.BALL_SPEED )
      this.dir.x = this.gameMode.BALL_SPEED * 0.9;
    if ( this.dir.x < ( this.gameMode.BALL_SPEED * 0.7 ) && this.dir.x > 0 )
      this.dir.x = ( this.gameMode.BALL_SPEED * 0.7 );
    if ( this.dir.x > -( this.gameMode.BALL_SPEED * 0.7 ) && this.dir.x < 0 )
      this.dir.x = -( this.gameMode.BALL_SPEED * 0.7 );
    this.dir.y = Math.sqrt( this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED - ( this.dir.x * this.dir.x ) );
    let rend: number = ( Math.floor( Math.random() * 2.1 ) - 1 );
    if ( rend < 0 )
      this.dir.y = - this.dir.y;
  }

  checkpaddle(){
    let paddlePos: number;
    let collisionBox: number = this.gameMode.PADDLE_SIZE + 10;

    if (this.pos.x < 15) {paddlePos = this.game.p[0].getY();}
    else
      paddlePos = this.game.p[1].getY();

    if ( this.pos.y >= paddlePos + collisionBox || this.pos.y <= paddlePos - 10 ) //10 = size of the ball
      return -this.gameMode.BALL_SPEED
    else if ( this.pos.y > paddlePos + collisionBox / 3 && this.pos.y < paddlePos + collisionBox / 2 )
      return 0
    else if ( this.pos.y >= paddlePos + collisionBox / 6 && this.pos.y < paddlePos + collisionBox / 3 )
      return -Math.sin( Math.PI / 6 ) * this.gameMode.BALL_SPEED; //30deg = pi/6
    else if ( this.pos.y >= paddlePos + collisionBox / 2 && this.pos.y < paddlePos + collisionBox * 2 / 3 )
      return Math.sin( Math.PI / 6 ) * this.gameMode.BALL_SPEED; //30deg = pi/6
    else if ( this.pos.y >= paddlePos && this.pos.y < paddlePos + collisionBox / 6 )
      return -Math.sin( Math.PI / 3 ) * this.gameMode.BALL_SPEED; //60deg = pi/3
    else if ( this.pos.y >= paddlePos + collisionBox * 2 / 3 && this.pos.y < paddlePos + collisionBox * 5 / 6 )
      return Math.sin( Math.PI / 3 ) * this.gameMode.BALL_SPEED; //60deg = pi/3
    else if ( this.pos.y >= paddlePos - 20 && this.pos.y < paddlePos ) //10 = size of the ball
      return -Math.sin( Math.PI / 2.3 ) * this.gameMode.BALL_SPEED //~86deg 
    else if ( this.pos.y >= paddlePos + collisionBox * 5 / 6 && this.pos.y < paddlePos + collisionBox )
      return Math.sin( Math.PI / 2.3 ) * this.gameMode.BALL_SPEED //~86deg 
    else
      return -this.gameMode.BALL_SPEED;
  }

  move() {
    // // ** TEST **
    // // set a random direction vector to ball
    // const v = new Victor(Math.random() - 0.5, Math.random() - 0.5);
    // v.normalize();
    // this.dir.mix(v, 0.2);
    // // ** END TEST **

    // // move the ball
    // this.dir.normalize();
    // this.pos.x += Math.floor(this.dir.x * this.gameMode.BALL_SPEED);
    // this.pos.y += Math.floor(this.dir.y * this.gameMode.BALL_SPEED);
    // if (this.pos.y < 0) this.pos.y = 0;
    // else if (
    //   this.pos.y >
    //   this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER
    // )
    //   this.pos.y = this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER;
    // if (this.pos.x < 0) this.pos.x = 0;
    // else if (
    //   this.pos.x >
    //   this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER
    // )
    //   this.pos.x = this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER;

    this.pos.x += this.dir.x * this.gameMode.BALL_SPEED;
    this.pos.y += this.dir.y * this.gameMode.BALL_SPEED;
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.dir.y*= -1;
    }
    else if (this.pos.y > this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER)
    {
      this.pos.y = this.gameMode.GAME_HEIGHT - this.gameMode.BALL_DIAMETER;
      this.dir.y*= -1;
    }
    if (this.pos.x < 15 || this.pos.x > this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER -15) 
    {
      let tmp = this.checkpaddle();
      if ( tmp != -this.gameMode.BALL_SPEED ) {
        this.dir.y = tmp;
        if ( this.dir.x < 0 )
          this.dir.x = Math.sqrt( this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED - this.dir.y * this.dir.y );
        else
          this.dir.x = -Math.sqrt( this.gameMode.BALL_SPEED * this.gameMode.BALL_SPEED - this.dir.y * this.dir.y );
      if (this.pos.x < 15) this.pos.x = 15;
      if (this.pos.x > this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER -15) this.pos.x = this.gameMode.GAME_WIDTH - this.gameMode.BALL_DIAMETER -15;
      return (0);
      }
      else {
        return (1);
      }
    }
    return(0);
  }

  toString() {
    return `\tx: ${this.pos.x}\n` + `\ty: ${this.pos.y}\n`;
  }
}
