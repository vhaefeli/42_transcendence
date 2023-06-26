import { Socket, io } from "socket.io-client";

class StatusSocketService {
  socket: Socket | undefined;
  url: string;
  connected: boolean | undefined;
  constructor() {
    this.url = import.meta.env.VITE_BACKEND_SERVER_URL;
    this.connect();
  }

  async wait_connected() {
    this.socket?.on("connect", () => {
      this.connected = this.socket?.connected;
    });

    for (let i = 0; this.connected === undefined; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (i > 50) this.connected = false;
    }

    if (this.connected) console.log(`socket.io/status connected successfully`);
    else console.error(`socket.io/status failed to connect`);
  }

  async ping() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit("message", "PING", (response: string) => {
      console.log(`Server responsded: ${response}`);
    });
  }

  async tryConnection(): Promise<boolean | undefined> {
    if (this.connected) return true;
    for (let i = 0; i < 3 && !this.connected; i++) {
      await this.connect();
    }
    return this.connected;
  }

  async connect() {
    this.connected = undefined;
    this.socket = io(`${this.url}/status`);
    await this.wait_connected();
  }
}

export const statusService = new StatusSocketService();
