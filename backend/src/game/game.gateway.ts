import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { RemoteSocket, Server, Socket } from 'socket.io';
import { WsGuard } from 'src/auth/ws.guard';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly debug: boolean;
  private readonly namespace = 'GAME';
  constructor(
    configService: ConfigService,
    private authService: AuthService,
    @Inject(forwardRef(() => GameService)) private gameService: GameService,
  ) {
    this.debug = configService.get<string>('SOCKET_DEBUG') === 'true';
  }
  @WebSocketServer() server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('connectToGame')
  connectToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { userId: number },
  ) {
    this.gameService.connect(+body.userId, socket);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('forceDisconnect')
  disconnectMe(@ConnectedSocket() client: any) {
    client.disconnect(true);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('tabletennis')
  pingPong(@MessageBody() payload: string) {
    if (payload === 'PING') return 'PONG';
    return 'WHAT?';
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const payload = await this.authService.socketConnectionAuth(
        client.handshake.auth.token,
      );
      client.request['user'] = payload;
      client.data['user'] = payload;
    } catch (error) {
      if (error?.name === 'JsonWebTokenError') {
        if (this.debug) Logger.debug('Client connection declined: bad token');
      } else Logger.error(error);
      client.disconnect();
      return;
    }
    if (this.debug) {
      Logger.debug(
        `${this.namespace}: {${client.request['user'].sub}, ${client.request['user'].username}} CONNECTED`,
      );
    }
  }

  async handleDisconnect(client: Socket) {
    if (this.debug)
      Logger.debug(
        `${this.namespace}: {${client.data.user?.sub}, ${client.data.user?.username}} DISCONNECTED`,
      );
  }

  async afterInit(server: Server) {
    if (this.debug) {
      Logger.debug(`${this.namespace}: gateway initialized`);
    }
    return;
  }
}
