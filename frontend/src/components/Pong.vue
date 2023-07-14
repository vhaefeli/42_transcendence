<template>
	<canvas ref="pongScreen" id="pong" width="606" height="498"></canvas>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'

	
	// const gameId:number 
	const pongScreen = ref(null)
	let paddleSize: number = 60;
	// let paddleSpeed: number = 5;
	// keysPressed: { [key: string]: boolean } = {};

	let playerPos: number = 249 - (paddleSize / 2);
  const playerSpeed = 10;
	let opponentPos: number = 249 - (paddleSize / 2);
	const playerName = 'PLAYER 1';
	const opponentName = 'PLAYER 2';
	let playerScore = 0; //score a envoye
	let opponentScore = 0;
	let ballX: number = 278;
	let ballY: number = 244;

	const ballSpeed = 6;

	let dx: number = (Math.floor(Math.random() * 21) - 10) / (10/ ballSpeed);
	console.log(dx);
	if (dx === 0 || dx === ballSpeed || dx === - ballSpeed)
		dx = ballSpeed * 0.9;
	if (dx < (ballSpeed * 0.7) && dx > 0)
		dx = (ballSpeed * 0.7);
	if (dx > -(ballSpeed * 0.7) && dx < 0)
		dx = -(ballSpeed * 0.7);
	let dy: number = Math.sqrt(ballSpeed * ballSpeed - (dx * dx));
	let rend: number = (Math.floor(Math.random() * 2.1) - 1);
	if (rend < 0)
		dy = - dy;

	// let dx = 0;
	// let dy = 2;

  enum PlayerAction {
    UP,
    DOWN,
    IDLE,
  }

	console.log(dx);
	console.log(dy);

  class KeyHandler {
    private keyUP: boolean;
    private keyDOWN: boolean;

    constructor() {
      this.keyUP = false;
      this.keyDOWN = false;
    }

    changeKey(keydown: boolean, event: any) {
        if (event.code == 'KeyW' || event.code == 'ArrowUp')
        {
          this.keyUP = keydown;
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
          this.keyDOWN = keydown;
        }
    }

    getKeyState(): PlayerAction {
      if (this.keyUP === this.keyDOWN) return PlayerAction.IDLE;
      if (this.keyUP) return PlayerAction.UP;
      if (this.keyDOWN) return PlayerAction.DOWN;
      return PlayerAction.IDLE;
    }
  }
  const keyHandler = new KeyHandler();

  document.addEventListener("keyup", (event) => {
    keyHandler.changeKey(false, event);
  });
  document.addEventListener("keydown", (event) => {
    keyHandler.changeKey(true, event);
  });


	function checkCollision(playerPos :number, ballY :number, paddleSize :number){
		console.log('playerPos ', playerPos, ' ballY ', ballY, 'paddleSize', paddleSize);
		
		if(ballY >= playerPos + paddleSize || ballY  <= playerPos - 10) //10 = size of the ball
			return -20
		if(ballY > playerPos + paddleSize/3 && ballY < playerPos + paddleSize/2)
			return 0
		if(ballY >= playerPos + paddleSize/6 && ballY < playerPos + paddleSize/3)
			return -0.25 //sin 30/2 
		if(ballY >= playerPos + paddleSize/2 && ballY < playerPos + paddleSize*2/3)
			return 0.25 //sin 30/2 
		if(ballY >= playerPos && ballY < playerPos+ paddleSize/6)
			return -Math.sin(Math.PI/3)/2
		if(ballY >= playerPos + paddleSize*2/3 && ballY < playerPos+ paddleSize*5/6)
			return Math.sin(Math.PI/3)/2
		if(ballY >= playerPos - 10 && ballY < playerPos) //10 = size of the ball
			return -Math.sin(1.5)/2 //~86deg 1.4 =>80deg
		if(ballY >= playerPos + paddleSize*5/6 && ballY < playerPos+ paddleSize)
			return Math.sin(1.5)/2 //~86deg 1.4 =>80deg
		else
		return -20;
	}


	onMounted(() => {
        console.log("pong screen: ", pongScreen.value)
		if (!pongScreen.value.getContext) {
			return console.error('no pongScreen');
		}
		var ctx = pongScreen.value.getContext('2d');
		console.log(ctx);

    async function movePlayer() {
      const action = keyHandler.getKeyState();
      if (action === PlayerAction.UP) // Touche "haut"
      { 
        if (playerPos > 0)
          playerPos-= playerSpeed;
        if ((playerPos < 0))
          playerPos = 0;
      } 
      else if (action === PlayerAction.DOWN) // Touche "bas"
      {
        if (playerPos < 498 - paddleSize)
          playerPos+= playerSpeed;
        if (playerPos > 498 - paddleSize)
          playerPos = 498 - paddleSize;
      }
    }

		async function play() {
			
			while (playerScore < 10 && opponentScore < 10)
			{
				await new Promise(resolve => setTimeout(resolve, 16 + 2/3));

        movePlayer();

				ctx.clearRect(0, 0, 606, 498);
				ballX+= dx;
				ballY+= dy;
				// up/down
				if (ballY < 0 || ballY > 488)
					dy = -dy;
				// right/left
				if (ballX > 598)
					dx = -dx;
				if (ballX < 15)
				{
					let tmp = checkCollision(playerPos, ballY, paddleSize)
	
					if (tmp!= -20)
					{
						dy = tmp;
						dx = -dx;
					}
					else
					{
						opponentScore++;
						ballX = 298;
						ballY = 244;

						let dx: number = (Math.floor(Math.random() * 21) - 10) / (10/ ballSpeed);
						if (dx === 0 || dx === ballSpeed || dx === - ballSpeed)
							dx = ballSpeed * 0.9;
						if (dx < (ballSpeed * 0.7) && dx > 0)
							dx = (ballSpeed * 0.7);
						if (dx > -(ballSpeed * 0.7) && dx < 0)
							dx = -(ballSpeed * 0.7);
						let dy: number = Math.sqrt(ballSpeed * ballSpeed - (dx * dx));
						let rend: number = (Math.floor(Math.random() * 2.1) - 1);
						if (rend < 0)
							dy = - dy;

						
						console.log(dx);
						console.log(dy);
					}
				}
				ctx.fillRect(ballX, ballY, 10, 10);
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';

				//net
				ctx.lineWidth = 5;
				ctx.setLineDash([20, 10]);
				ctx.beginPath();
				ctx.moveTo(303, 14);
				ctx.lineTo(303, 484);
				ctx.stroke();

				
				// names
				ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
				ctx.font = '40px Array-Regular';
				ctx.textAlign = 'center';
				ctx.fillText(playerName, 151.5, 50);
				ctx.fillText(opponentName, 454.5, 50);


				// score
				ctx.fillStyle = 'rgba(237, 156, 219, 0.5)';
				ctx.font = '80px Array-Regular';
				ctx.fillText(playerScore, 151.5, 120);
				ctx.fillText(opponentScore, 454.5, 120);

				// paddle
				ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
				ctx.fillRect(10, playerPos, 5, paddleSize);
				ctx.fillRect(591, opponentPos, 5, paddleSize);
			}
		}
	play();


	})



</script>

<style>

</style>
