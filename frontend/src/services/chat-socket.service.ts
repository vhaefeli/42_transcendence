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
    }, (res) => {
      console.log(res);
    });
  }

  async reload() {
    this.socket?.emit('dmHistory');
  }

}

export const chatService = new ChatService();
