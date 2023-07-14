import { SocketService } from "./socket.service";

export class GameService extends SocketService {
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

  async ping() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit(this.ping_event, "PING", (response: string) => {
      console.log(`Server responded: ${response}`);
    });
  }
}
