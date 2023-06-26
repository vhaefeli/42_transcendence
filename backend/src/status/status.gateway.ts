import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'status',
  cors: {
    origin: '*',
  },
})
export class StatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    if (payload === 'PING') return 'PONG';
    Logger.log(payload);
    return 'Hello world!';
  }

  afterInit() {
    //Logger.log('Gateway initiated');
    return;
  }

  handleConnection(client: any, ...args: any[]) {
    Logger.log(`Client connected`);
    Logger.log(client.conn);
  }

  handleDisconnect(client: any) {
    Logger.log(`Client disconnected`);
  }
}
