import { useRouter } from "vue-router";
import { SocketService } from "./socket.service";

export enum PlayerAction {
  IDLE,
  UP,
  DOWN,
}

export class GameService extends SocketService {
  private gameId: number | undefined;
  private router = useRouter();
  private readonly pingTimes = new Array<number>();
  constructor() {
    super("game");
  }

  async OnInit(): Promise<void> {
    this.onConnect(
      () => {
        setInterval(() => {
          this.CalculateDelay();
        }, 500);
      },
      { timeout: 1000 }
    );
    return;
  }

  getAveragePing() {
    let sum = 0;
    this.pingTimes.forEach((ping) => (sum += ping));
    return (sum / this.pingTimes.length).toFixed(2);
  }

  async CalculateDelay() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit(
      "testLag",
      { client: new Date().getTime() },
      (response) => {
        const client = response.client;
        const now = new Date().getTime();
        this.pingTimes.push(now - client);
        if (this.pingTimes.length > 30) this.pingTimes.shift();
      }
    );
  }

  async connectToGame(gameId: number) {
    if (!(await this.tryConnection())) return;
    this.gameId = gameId;

    this.socket?.off("exception");
    this.socket?.on("exception", (exception) => {
      const msg =
        typeof exception.message === "string"
          ? exception.message
          : exception.message[0];
      this.socket?.off("exception");
      this.router.push(`/game?connect_error=${encodeURIComponent(msg)}`);
      return;
    });
    this.socket?.emit("connectToGame", { gameId: gameId });
  }

  async sendPlayerAction(action: PlayerAction) {
    this.socket?.off("exception");
    this.socket?.emit("action", { gId: this.gameId, a: action });
  }

  async sendIsReady() {
    if (this.gameId === undefined) {
      console.log("not connected to game");
      return;
    }
    if (!this.connected) {
      console.log("not connected to socket");
      return;
    }

    this.socket?.off("exception");
    this.socket?.on("exception", (exception) => {
      const msg =
        typeof exception.message === "string"
          ? exception.message
          : exception.message[0];
      this.socket?.off("exception");
      this.router.push(`/game?is_ready_error=${encodeURIComponent(msg)}`);
      return;
    });
    this.socket?.emit("ready", { gameId: this.gameId });
  }

  async ping() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit(this.ping_event, "PING", (response: string) => {
      console.log(`Server responded: ${response}`);
    });
  }
}
