import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
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
  namespace: 'status',
  cors: {
    origin: '*',
  },
})
export class StatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private debug: boolean;
  constructor(configService: ConfigService, private authService: AuthService) {
    this.debug = configService.get<string>('SOCKET_DEBUG') === 'true';
  }

  @WebSocketServer() server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('message')
  handleMessage(_client: any, payload: any): string {
    if (payload === 'PING') return 'PONG';
    return 'Hello world!';
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('i-am-alive')
  async clientIsOnline(client: any) {
    client.data['last_online'] = new Date();
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('forceDisconnect')
  disconnectMe(client: any) {
    client.disconnect(true);
  }

  afterInit() {
    if (this.debug) {
      Logger.debug('Status gateway initialized');
    }
    return;
  }

  async handleConnection(client: any, ...args: any[]) {
    try {
      const payload = await this.authService.socketConnectionAuth(
        client.handshake.auth.token,
      );
      client.request['user'] = payload;
      client.data['user'] = payload;
      client.data['last_online'] = new Date();
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

  handleDisconnect(client: any) {
    if (this.debug)
      Logger.debug(
        `{${client.request?.user?.sub}, ${client.request?.user?.username}} DISCONNECTED`,
      );
  }
}
