import { useSessionStore } from "@/stores/SessionStore";
import { io, Socket } from "socket.io-client";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

class StatusSocketService {
  socket: Socket | undefined;
  url: string;
  connected: boolean | undefined;
  sessionStore: any;

  constructor() {
    this.url = import.meta.env.VITE_BACKEND_SERVER_URL;
    this.loadSessionStore();
  }

  async loadSessionStore() {
    // Wait for pinia to initialize and then get sessionStore
    while (this.sessionStore === undefined) {
      try {
        this.sessionStore = useSessionStore();
      } catch {
        await sleep(100);
      }
    }
    await this.connect();

    // Subscribe to changes on sessionStore
    // connect to socket on login
    // disconnect socket on logout
    this.sessionStore.$subscribe((mutation: any) => {
      if (mutation.events.key === "isLoggedIn") {
        if (mutation.events.newValue === true) {
          this.connect();
        } else if (mutation.events.newValue === false) {
          this.socket?.emit("forceDisconnect");
          this.socket?.disconnect();
          console.log("socket.io/status disconnected");
        }
      }
    });
  }

  async wait_connected() {
    this.socket?.on("connect", () => {
      this.connected = this.socket?.connected;
    });

    for (let i = 0; this.connected === undefined; i++) {
      await sleep(100);
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
    if (!this.sessionStore.isLoggedIn) return;
    this.connected = undefined;
    this.socket = io(`${this.url}/status`, {
      auth: {
        token: this.sessionStore.access_token,
      },
    });
    await this.wait_connected();
  }
}

export const statusService = new StatusSocketService();
