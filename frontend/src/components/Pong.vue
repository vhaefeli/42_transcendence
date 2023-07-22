<template>
  <span v-if="textError?.length">
    <p class="text-white" id="gameError">{{ textError }}</p>
    <router-link class="t-btn-pink text-white" to="/game-settings" id="goBack"
      >Go Back</router-link
    >
  </span>
  <span v-show="textResult?.length" class="blinking-text" id="gameResult">{{ textResult }}</span>

   <span v-if="textResult?.length"><router-link class="t-btn-pink text-white" to="/game-settings" id="goBack"
      >Go Back</router-link>
  </span>
  <span
    v-show="connectedToGame && !isReadyToPlay"
    class="blinking-text"
    id="ready"
    >press ENTER<br />to set as ready</span
  >
  <span v-show="isReadyToPlay && !isGameActive" class="blinking-text" id="wait"
    >waiting for<br />opponent</span
  >
  <canvas ref="pongScreen" id="pong" width="756" height="498"></canvas>
</template>

<script setup lang="ts">
import { GameService, PlayerAction } from "@/services/game-socket.service";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";
import { ref, onMounted, watch } from "vue";
import { useRoute, type LocationQuery, useRouter } from "vue-router";
import ArrayFont from '../assets/fonts/array/fonts/Array-Regular.woff'

const userStore = useUserStore();
const sessionStore = useSessionStore();
userStore.getMe(sessionStore.access_token);

const pongScreen = ref(null);
// a recuperer du back requete http

const playerName = "PLAYER 1";
const opponentName = "PLAYER 2";

const canvasWidth = 756;
const canvasHeight = 498;

let paddleSize = 60;

// a recuperer du back socket
const ballSize = 10;
let ballX: number = canvasWidth / 2 - ballSize / 2;
let ballY: number = canvasHeight / 2 - ballSize / 2;

let playerPos: number = canvasHeight / 2 - paddleSize / 2;
let opponentPos: number = canvasHeight / 2 - paddleSize / 2;

let playerScore = 0;
let opponentScore = 0;

// socket connection
const connectedToGame = ref(false);
const isReadyToPlay = ref(false);
const isGameActive = ref(false);
const gameSocket = new GameService();

let gameIdToConnect: number | undefined;

// error handling
const textError = ref<string>();
const textResult = ref<string>();
const route = useRoute();
const router = useRouter();

handleQueryParams(route?.query);
watch(
  () => route?.query,
  (params) => {
    handleQueryParams(params);
  }
);

function handleQueryParams(params: LocationQuery) {
  const connect_error = params?.connect_error;
  if (connect_error?.length) {
    const msg = `Connection error: ${connect_error}`;
    textError.value = msg;
    connectedToGame.value = false;
  }
  const is_ready_error = params?.is_ready_error;
  if (is_ready_error?.length) {
    const msg = `isReady error: ${is_ready_error}`;
    textError.value = msg;
    isReadyToPlay.value = false;
  }
  const gameId = params?.gameId;
  if (gameId != undefined) gameIdToConnect = +gameId;
  else if (gameIdToConnect === undefined)
    textError.value = "No gameId provided";
  if (params?.quit === "true") {
    gameSocket.socket?.emit("forceDisconnect");
    router.push("/game-settings");
  } else {
    //router.push("/game");
  }
}

class KeyHandler {
  private keyUP: boolean;
  private keyDOWN: boolean;
  private lastKeyState = PlayerAction.IDLE;

  constructor() {
    this.keyUP = false;
    this.keyDOWN = false;
  }

  changeKey(keydown: boolean, event: any) {
    if (event.code == "KeyW" || event.code == "ArrowUp") {
      this.keyUP = keydown;
    } else if (event.code == "KeyS" || event.code == "ArrowDown") {
      this.keyDOWN = keydown;
    }
    this.sendNewKeyState();
  }

  getKeyState(): PlayerAction {
    // action du enter
    if (this.keyUP === this.keyDOWN) return PlayerAction.IDLE;
    if (this.keyUP) return PlayerAction.UP;
    if (this.keyDOWN) return PlayerAction.DOWN;
    return PlayerAction.IDLE;
  }

  sendNewKeyState() {
    const keyState = this.getKeyState();
    if (keyState !== this.lastKeyState && isGameActive.value) {
      this.lastKeyState = keyState;
      gameSocket.sendPlayerAction(keyState);
    }
  }
}
const keyHandler = new KeyHandler();

function sendIsReady() {
  if (!connectedToGame.value || isGameActive.value) return;
  gameSocket.sendIsReady();
  isReadyToPlay.value = true;
}

document.addEventListener("keyup", (event) => {
  keyHandler.changeKey(false, event);
});
document.addEventListener("keydown", (event) => {
  if (event.code === "Enter") sendIsReady();
  else keyHandler.changeKey(true, event);
});

onMounted(() => {
  gameSocket.socket?.on("connect", () => {
    // connect to game
    if (gameIdToConnect === undefined) return;
    gameSocket.connectToGame(gameIdToConnect);
    connectedToGame.value = true;

    // receive score modification from socket
    gameSocket.socket?.on("score", (response) => {
      if (response[0].id === userStore.user.id) {
        playerScore = response[0].score;
        opponentScore = response[1].score;
      } else {
        playerScore = response[1].score;
        opponentScore = response[0].score;
      }
      isGameActive.value = true;
      console.log(`new score: ${playerScore} x ${opponentScore}`);
    });

    // receive game update and draw
    gameSocket.socket?.on("game", (response) => {
      if (!isGameActive.value) return;
      if (response.p[0].id === userStore.user.id) {
        playerPos = response.p[0].y;
        opponentPos = response.p[1].y;
        ballX = response.b.x;
      } else {
        playerPos = response.p[1].y;
        opponentPos = response.p[0].y;
        ballX = canvasWidth - response.b.x;
      }
      ballY = response.b.y;
      draw();
    });

    gameSocket.socket?.on("gameIsOver", () => {
      if (!isGameActive.value) textResult.value = "Game was canceled";
      else if (playerScore > opponentScore) textResult.value = "You won";
      else if (playerScore < opponentScore) textResult.value = "You lost";
      else if (playerScore === opponentScore) textResult.value = "Draw";
    });
  });

  console.log("pong screen: ", pongScreen.value);
  if (!pongScreen.value.getContext) {
    return console.error("no pongScreen");
  }
  var ctx = pongScreen.value.getContext("2d");
  console.log(ctx);

  // ==> envoie size du canevas au back
  
  let chargNum = 0;
  async function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (chargNum == 0)
    {
      const font = new FontFace('Array-Regular', 'url(' + ArrayFont + ')');
        await font.load();
        document.fonts.add(font);
      chargNum = 1;
    }
  

    // ball
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(ballX, ballY, ballSize, ballSize);

    //net
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 5;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 14);
    ctx.lineTo(canvasWidth / 2, 484);
    ctx.stroke();

    // names
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "40px Array-Regular";
    ctx.textAlign = "center";
    ctx.fillText(playerName, canvasWidth / 4, 50);
    ctx.fillText(opponentName, (canvasWidth / 4) * 3, 50);

    // score
    ctx.fillStyle = "rgba(237, 156, 219, 0.5)";
    ctx.font = "80px Array-Regular";
    ctx.fillText(playerScore, canvasWidth / 4, 120);
    ctx.fillText(opponentScore, (canvasWidth / 4) * 3, 120);

    // paddle
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(10, playerPos, 5, paddleSize);
    ctx.fillRect(canvasWidth - 10 - 5, opponentPos, 5, paddleSize);
    // }
  }
  // fonction qui recoit les sockets
  draw();
});
</script>

<style>
#pong {
  position: absolute;
  top: 14.5%;
  height: 71.7%;
  left: 50%;
  transform: translateX(-50%);
  /* background-color: greenyellow; */
}

#ready,
#wait, #gameResult {
  color: white;
  width: 100%;
  text-align: center;
  position: absolute;
  font-family: "Array-Regular";
  font-size: 10vw;
  top: 27%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}

#gameResult {
  /* font-size: medium; */
}

#goBack {
  position: absolute;
  align-items: center;
  justify-content: center;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  background-color: var(--pink);
}

#gameError{
  font-size:x-large;
  color: white;
  width: 100%;
  text-align: center;
  position: absolute;
  /* font-size: 8vh; */
  top: 107%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}

.blinking-text {
  animation: blink-animation 1.5s infinite;
}

@keyframes blink-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
