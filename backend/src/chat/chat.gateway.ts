import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
  private readonly namespace = 'CHAT';
  constructor(configService: ConfigService, private authService: AuthService) {
    this.debug = configService.get<string>('SOCKET_DEBUG') === 'true';
  }
  @WebSocketServer() server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string; date: string },
  ): void {
    const message = {
      message: payload.message,
      username: client.data?.user.username,
      date: payload.date,
    };
    this.server.emit('message', message);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('tabletennis')
  pingPong(@MessageBody() payload: string) {
    if (payload === 'PING') return 'PONG';
    return 'WHAT?';
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('forceDisconnect')
  disconnectMe(@ConnectedSocket() client: any) {
    client.disconnect(true);
  }

  async handleConnection(client: any, ...args: any[]) {
    try {
      const payload = await this.authService.socketConnectionAuth(
        client.handshake.auth.token,
      );
      client.request['user'] = payload;
      client.data['user'] = payload;
    } catch (error) {
      //if (this.debug) Logger.debug('Client connection declined: bad token');
      client.disconnect();
      return;
    }
    if (this.debug) {
      Logger.debug(
        `${this.namespace}: {${client.request.user?.sub}, ${client.request.user?.username}} CONNECTED`,
      );
    }
  }

  async handleDisconnect(client: any) {
    if (this.debug)
      Logger.debug(
        `${this.namespace}: {${client.request.user?.sub}, ${client.request.user?.username}} DISCONNECTED`,
      );
  }

  async afterInit(server: any) {
    if (this.debug) {
      Logger.debug(`${this.namespace}: gateway initialized`);
    }
    return;
  }
}
