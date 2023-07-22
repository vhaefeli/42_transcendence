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
  constructor() {
    super("game");
  }

  async OnInit(): Promise<void> {
    this.onConnect(
      () => {
        this.CalculateDelay();
      },
      { timeout: 1000 }
    );
    return;
  }

  async CalculateDelay() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit(
      "testLag",
      { client: new Date().getTime() },
      (response) => {
        const client = response.client;
        const server = response.server;
        const now = new Date().getTime();
        console.log("Client server communication delay in ms");
        console.log(`client -> server: ${server - client}`);
        console.log(`server -> client: ${now - server}`);
        console.log(`round trip: ${now - client}`);
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
