<template>
    <canvas ref="pongScreen" id="pong" width="606" height="498"></canvas>

</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  const pongScreen = ref( null )

  // a recuperer du back requete http

  const playerName = 'PLAYER 1';
  const opponentName = 'PLAYER 2';

  const canvasWidth: number = 606;
  const canvasHeight: number = 498;

  let paddleSize: number = 60;

    // a recuperer du back socket
  const ballSize = 10;
  let ballX: number = canvasWidth / 2 - (ballSize / 2);
  let ballY: number = canvasHeight / 2 - (ballSize / 2);
  

  let playerPos: number = canvasHeight / 2 - (paddleSize / 2);
  let opponentPos: number = canvasHeight / 2 - (paddleSize / 2);;

  let playerScore: number = 0; 
  let opponentScore: number = 0;

	

  enum PlayerAction {
  UP,
  DOWN,
  IDLE,
  }

  class KeyHandler {
    private keyUP: boolean;
    private keyDOWN: boolean;
    private playing: boolean;

    constructor () {
      this.keyUP = false;
      this.keyDOWN = false;
      this.playing = false;
    }

    changeKey( keydown: boolean, event: any ) {

      if ( event.code == 'Enter') {
        this.playing = true;
      }
      if ( event.code == 'KeyW' || event.code == 'ArrowUp' ) {
        this.keyUP = keydown;
      }
      else if ( event.code == 'KeyS' || event.code == 'ArrowDown' ) {
        this.keyDOWN = keydown;
      }
    }

    getKeyState(): PlayerAction {
      // action du enter
      if ( this.keyUP === this.keyDOWN ) return PlayerAction.IDLE;
      if ( this.keyUP ) return PlayerAction.UP;
      if ( this.keyDOWN ) return PlayerAction.DOWN;
      return PlayerAction.IDLE;
    }
  }
  const keyHandler = new KeyHandler();
  

  document.addEventListener( "keyup", ( event ) => {
  keyHandler.changeKey( false, event );
  } );
  document.addEventListener( "keydown", ( event ) => {
  keyHandler.changeKey( true, event );
  } );

  onMounted( () => {
  console.log( "pong screen: ", pongScreen.value )
  if ( !pongScreen.value.getContext ) {
    return console.error( 'no pongScreen' );
  }
  var ctx = pongScreen.value.getContext( '2d' );
  console.log( ctx );

  // ==> envoie size du canevas au back

  async function draw() {

      ctx.clearRect( 0, 0, canvasWidth, canvasHeight );

      // ball
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect( ballX, ballY, ballSize, ballSize );

      //net
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 5;
      ctx.setLineDash( [ 20, 10 ] );
      ctx.beginPath();
      ctx.moveTo( 303, 14 );
      ctx.lineTo( 303, 484 );
      ctx.stroke();


      // names
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '40px Array-Regular';
      ctx.textAlign = 'center';
      ctx.fillText( playerName, 151.5, 50 );
      ctx.fillText( opponentName, 454.5, 50 );


      // score
      ctx.fillStyle = 'rgba(237, 156, 219, 0.5)';
      ctx.font = '80px Array-Regular';
      ctx.fillText( playerScore, canvasWidth / 4, 120 );
      ctx.fillText( opponentScore, canvasWidth / 4 *3, 120 );

      // paddle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect( 10, playerPos, 5, paddleSize );
      ctx.fillRect( canvasWidth - 10 - 5, opponentPos, 5, paddleSize );
    // }
  }
// fonction qui recoit les sockets
draw();

  } )


</script>


<style></style>
