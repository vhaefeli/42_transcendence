<template>
  <div class="flex flex-row text-white">
    <!-- <p v-if="true" class="w-6 text-white" id="ft-ping-info">
      ping: {{ averagePing }} ms
    </p> -->
    <span v-if="textError?.length">
      <p id="gameError">{{ textError }}</p>
      <router-link class="t-btn-pink" to="/game-settings" id="goBack"
        >Go Back</router-link
      >
    </span>
    <span v-if="textResult?.length">
      <p id="gameResult" class="blinking-text">{{ textResult }}</p>
      <router-link class="t-btn-pink" to="/game-settings" id="goBack"
        >Go Back</router-link
      >
    </span>
  </div>
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
import axios, { AxiosError } from "axios";
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useRoute, type LocationQuery, useRouter } from "vue-router";
import ArrayFont from "../assets/fonts/array/fonts/Array-Regular.woff";

const emits = defineEmits(['noCross']);

const userStore = useUserStore();
const sessionStore = useSessionStore();
userStore.getMe(sessionStore.access_token);

const pongScreen = ref(null);


let gameModeInfo = {
  name: "INTERMEDIATE",
	params: {
		BALL_DIAMETER: 10,
		BALL_SPEED: 2,
		BALL_START_ROUND_WAIT: 1,
		GAME_HEIGHT: 498,
		GAME_WIDTH: 756,
		PADDLE_COLLISION_EXTENSION: 30,
		PADDLE_DISTANCE_FROM_BORDER: 15,
		PADDLE_SIZE: 60,
		PADDLE_SPEED: 10,
		POINTS_TO_WIN: 5,
    GAME_COLOR: "rgba(148, 221, 255, 0.839)",
	}
};

let opponentName: string | undefined;
const canvasWidth = 756;
const canvasHeight = 498;
let gameColor = gameModeInfo.params.GAME_COLOR;

// a recuperer du back socket
let ballX: number;
let ballY: number;

let playerPos: number;
let opponentPos: number;

resetBallAndPlayerPos();

let playerScore = 0;
let opponentScore = 0;

function resetBallAndPlayerPos() {
  ballX = canvasWidth / 2 - gameModeInfo.params.BALL_DIAMETER / 2;
  ballY = canvasHeight / 2 - gameModeInfo.params.BALL_DIAMETER / 2;
  playerPos = canvasHeight / 2 - gameModeInfo.params.PADDLE_SIZE / 2;
  opponentPos = canvasHeight / 2 - gameModeInfo.params.PADDLE_SIZE / 2;
}

// socket connection
const connectedToGame = ref(false);
const isReadyToPlay = ref(false);
const isGameActive = ref(false);
const gameSocket = new GameService();

let gameIdToConnect: number | undefined;

// error handling
let averagePing = ref<number>();
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

onBeforeUnmount(() => {
  gameSocket.socket?.emit("forceDisconnect");
})

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
  if (!connectedToGame.value || isGameActive.value || isReadyToPlay.value) return;
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

    // Receive game mode info on connection
    gameSocket.socket?.on("gameModeInfo", (response) => {
      gameModeInfo = response;
      gameColor = gameModeInfo.params.GAME_COLOR;
      resetBallAndPlayerPos();
      draw();
      // console.log(`Loaded info on gameMode: ${gameModeInfo.name}`);
    });

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
      // console.log(`new score: ${playerScore} x ${opponentScore}`);
      draw();
    });

    // receive game update and draw
    gameSocket.socket?.on("game", (response) => {
      if (!isGameActive.value) return;
      if (response.p[0].id === userStore.user.id) {
        playerPos = response.p[0].y;
        opponentPos = response.p[1].y;
        ballX = response.b.x;
        if (opponentName === undefined) saveOpponentUsername(response.p[1].id);
      } else {
        playerPos = response.p[1].y;
        opponentPos = response.p[0].y;
        ballX = canvasWidth - response.b.x - gameModeInfo.params.BALL_DIAMETER;
        if (opponentName === undefined) saveOpponentUsername(response.p[0].id);
      }
      ballY = response.b.y;
      draw();
    });

    // print result when game is over
    gameSocket.socket?.on("gameIsOver", () => {
      if (!isGameActive.value) {
        textResult.value = "Game Canceled";
        connectedToGame.value = true;
        isReadyToPlay.value = true;
        isGameActive.value = true;
      } 
      else if (playerScore > opponentScore) textResult.value = "You won";
      else if (playerScore < opponentScore) textResult.value = "You lost";
      else if (playerScore === opponentScore) textResult.value = "Draw";
    });

    // get ping updates from game socket
    setInterval(() => {
      if (!connectedToGame.value) return;
      averagePing.value = gameSocket.getAveragePing();
    }, 100);
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

    if (chargNum == 0) {
      const font = new FontFace("Array-Regular", "url(" + ArrayFont + ")");
      await font.load();
      document.fonts.add(font);
      chargNum = 1;
    }

    // ball
    ctx.fillStyle = gameColor;
    ctx.fillRect(ballX, ballY, gameModeInfo.params.BALL_DIAMETER, gameModeInfo.params.BALL_DIAMETER);
    
    //net
    ctx.strokeStyle = gameColor;
    ctx.lineWidth = 5;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 14);
    ctx.lineTo(canvasWidth / 2, 484);
    ctx.stroke();

    // names
    let opponentUsername: string | undefined = "Player 2";

    ctx.fillStyle = gameColor;
    ctx.font = "40px Array-Regular";
    ctx.textAlign = "center";
    ctx.fillText(userStore.user.username.substr(0, 12), canvasWidth / 4, 50);
    if (opponentName !== undefined) opponentUsername = opponentName;
    ctx.fillText(opponentUsername.substr(0, 12), (canvasWidth / 4) * 3, 50);

    // score
    ctx.fillStyle = "rgba(237, 156, 219, 0.5)";
    ctx.font = "80px Array-Regular";
    ctx.fillText(playerScore, canvasWidth / 4, 120);
    ctx.fillText(opponentScore, (canvasWidth / 4) * 3, 120);

    if (playerScore === gameModeInfo.params.POINTS_TO_WIN ||
      opponentScore === gameModeInfo.params.POINTS_TO_WIN)
    {
      emits('noCross', false);
    }

    // paddle
    ctx.fillStyle = gameColor;
    ctx.fillRect(10, playerPos, 5, gameModeInfo.params.PADDLE_SIZE);
    ctx.fillRect(canvasWidth - 10 - 5, opponentPos, 5, gameModeInfo.params.PADDLE_SIZE);
    // }
  }
  // fonction qui recoit les sockets
  async function start() {
    await userStore.getMe(sessionStore.access_token);
    draw();
  }

  start();

  async function saveOpponentUsername(userId: number) {
    await axios({
      url: `/api/user/profile/id/${userId}`,
      method: "get",
      headers: { Authorization: `Bearer ${sessionStore.access_token}` },
    })
      .then((response) => {
        opponentName = response.data.username;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status == 401) {
          console.log(
            `invalid access token: ${error.response?.status} ${error.response?.statusText}`
          );
          router.push("/login?logout=true");
        } else {
          console.log(
            `unexpected error: ${error.response?.status} ${error.response?.statusText}`
          );
        }
        return false;
      });
  }
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

#ft-ping-info {
  font-size: small;
  color: white;
  width: 10%;
  text-align: left;
  position: absolute;
  top: 107%;
  left: 1%;
}

#ready,
#wait,
#gameResult {
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

#gameError {
  font-size: x-large;
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
