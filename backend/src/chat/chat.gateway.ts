import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsGuard } from 'src/auth/ws.guard';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private debug: boolean;
  constructor(configService: ConfigService, private authService: AuthService) {
    this.debug = configService.get<string>('SOCKET_DEBUG') === 'true';
  }
  @WebSocketServer() server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() payload: { message: string; username: string; date: string },
  ): void {
    this.server.emit('message', payload);
  }

  async handleConnection(client: any, ...args: any[]) {
    try {
      const payload = await this.authService.socketConnectionAuth(
        client.handshake.auth.token,
      );
      client.request['user'] = payload;
      client.data['user'] = payload;
    } catch (error) {
      if (this.debug) Logger.debug('Client connection declined: bad token');
      client.disconnect();
      return;
    }
    if (this.debug) {
      Logger.debug(
        `{${client.request?.user?.sub}, ${client.request?.user?.username}} CONNECTED`,
      );
    }
  }

  async handleDisconnect(client: any) {
    if (this.debug)
      Logger.debug(
        `{${client.request?.user?.sub}, ${client.request?.user?.username}} DISCONNECTED`,
      );
  }

  async afterInit(server: any) {
    if (this.debug) {
      Logger.debug('Gateway initiated');
    }
    return;
  }
}
