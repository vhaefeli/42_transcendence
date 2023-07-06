import { useSessionStore } from "@/stores/SessionStore";
import { Socket, io } from "socket.io-client";

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export abstract class SocketService {
  socket: Socket | undefined;
  protected sessionStore: ReturnType<typeof useSessionStore> | undefined;
  protected connected: boolean | undefined;
  protected readonly url: string;
  protected readonly namespace: string;
  protected readonly ping_event: string;

  constructor(namespace: string, ping_event = "tabletennis") {
    this.url = import.meta.env.VITE_BACKEND_SERVER_URL;
    this.namespace = namespace;
    this.ping_event = ping_event;
    this.loadSessionStore();
  }

  async loadSessionStore() {
    while (this.sessionStore === undefined) {
      try {
        this.sessionStore = useSessionStore();
      } catch {
        await sleep(200);
      }
    }
    this.OnInit();
    await this.connect();
  }

  async connect() {
    if (!this.sessionStore?.isLoggedIn) return;
    this.connected = undefined;
    this.socket = io(`${this.url}/${this.namespace}`, {
      auth: {
        token: this.sessionStore?.access_token,
      },
    });
    await this.wait_connected();
  }

  async wait_connected() {
    this.socket?.on("connect", () => {
      this.socket?.emit(this.ping_event, "PING", (response: string) => {
        if (response === "PONG") this.connected = true;
      });
    });

    for (let i = 0; this.connected === undefined; i++) {
      await sleep(200);
      if (i > 50) this.connected = false;
    }

    if (this.connected) {
      console.log(`socket.io/${this.namespace} connected successfully`);
    } else console.error(`socket.io/${this.namespace} failed to connect`);
  }

  async tryConnection(): Promise<boolean | undefined> {
    if (this.connected) return true;
    for (let i = 0; i < 3 && !this.connected; i++) {
      await this.connect();
    }
    return this.connected;
  }

  async onConnect(
    callback: Function,
    timeout: { timeout: number; interval?: number },
    ...args: any[]
  ) {
    if (timeout.interval === undefined) timeout.interval = 50;
    for (let i = 0; i < timeout.timeout / timeout.interval; i++) {
      if (this.connected === true) break;
      await sleep(timeout.interval);
    }
    callback(...args);
  }

  // the OnInit() function is executed once sessionStore is loaded
  // use onConnect() to only execute on connection
  abstract OnInit(): Promise<void> | void;
}
