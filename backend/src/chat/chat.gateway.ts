import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io';

@WebSocketGateway({
    namespace: 'chat',
    cors: {
      origin: '*',
    },
  })
export class ChatGateway {
    @WebSocketServer() server: Server;

    @SubscribeMessage('message')
    handleMessage(@MessageBody() payload: { message: string, username: string, date: string }): void {
        this.server.emit('message', payload);
    }
}