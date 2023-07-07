import { SocketService, sleep } from "./socket.service";

class ChatService extends SocketService {
  private readonly dateOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "Europe/Zurich",
    hour12: false,
  };

  constructor() {
    super("chat");
  }

  async OnInit() {
    return;
  }

  async sendNewMessage(content: string, id: number) {
    if (!(await this.tryConnection())) return;
    this.socket?.emit("dm", {
      toId: id,
      message: content,
      date: new Date().toLocaleString("en-US", this.dateOptions)
    });
  }

  async reload() {
    this.socket?.emit("forceDisconnect");
    this.socket?.disconnect();
    this.connected = undefined;
    console.log("socket.io/status disconnected");
    await sleep(2000);
    if (!(await this.tryConnection())) return;
    this.onConnect((chat) => {
      chat.socket?.on('dm', (payload) => {
          console.log(payload);
      });
    },
    { timeout: 10000 },
    this)
  }

}

export const chatService = new ChatService();
