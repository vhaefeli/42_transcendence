import { SocketService } from "./socket.service";

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

  async sendNewMessage(content: string) {
    if (!(await this.tryConnection())) return;
    this.socket?.emit("message", {
      message: content,
      date: new Date().toLocaleString("en-US", this.dateOptions),
    });
  }
}

export const chatService = new ChatService();
