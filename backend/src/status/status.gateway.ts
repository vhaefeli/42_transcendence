import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsGuard } from 'src/auth/ws.guard';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({
  namespace: 'status',
  cors: {
    origin: '*',
  },
})
export class StatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private secret: string;
  private debug: boolean;
  constructor(
    private jwtService: JwtService,
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.secret = configService.get<string>('JWT_SECRET_KEY');
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
      Logger.debug('Gateway initiated');
    }
    return;
  }

  async handleConnection(client: any, ...args: any[]) {
    try {
      const payload = this.jwtService.verify(client.handshake.auth.token, {
        secret: this.secret,
      });

      await this.prisma.user.findFirstOrThrow({
        where: { id: payload.sub, username: payload.username },
      });
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