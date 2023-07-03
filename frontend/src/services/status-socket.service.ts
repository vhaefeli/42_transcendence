import { SocketService } from "./socket.service";

class StatusService extends SocketService {
  constructor() {
    super("status");
  }

  async OnInit(): Promise<void> {
    // Subscribe to changes on sessionStore
    // connect to socket on login
    // disconnect socket on logout
    this.sessionStore?.$subscribe((mutation: any) => {
      if (mutation.events.key === "isLoggedIn") {
        if (mutation.events.newValue === true) {
          this.connect();
        } else if (mutation.events.newValue === false) {
          this.socket?.emit("forceDisconnect");
          this.socket?.disconnect();
          this.connected = undefined;
          console.log("socket.io/status disconnected");
        }
      }
    });

    setInterval(() => {
      this.iAmAlive();
    }, 1000 * 15);
  }

  async iAmAlive() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit("i-am-alive");
  }

  async ping() {
    if (!(await this.tryConnection())) return;
    this.socket?.emit("message", "PING", (response: string) => {
      console.log(`Server responded: ${response}`);
    });
  }
}

export const statusService = new StatusService();
