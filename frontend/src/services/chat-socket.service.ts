import { SocketService, sleep } from "./socket.service";

class ChatService extends SocketService {
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
      date: new Date().getTime()
    }, (res) => {
      console.log(res);
    });
  }

  async reload() {
    this.socket?.emit('dmHistory');
  }
}

export const chatService = new ChatService();
