import { Logger } from '@nestjs/common';
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
  secret: string;
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.secret = configService.get<string>('JWT_SECRET_KEY');
  }

  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(_client: any, payload: any): string {
    if (payload === 'PING') return 'PONG';
    return 'Hello world!';
  }

  @SubscribeMessage('i-am-alive')
  async clientIsOnline() {
    return;
  }

  @SubscribeMessage('forceDisconnect')
  disconnectMe(client: any) {
    client.disconnect(true);
  }

  afterInit() {
    // Logger.log('Gateway initiated');
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
    } catch (error) {
      Logger.log('Client connection declined: bad token');
      client.disconnect();
      return;
    }
    Logger.log(
      `{${client.request.user.sub}, ${client.request.user.username}} CONNECTED`,
    );
  }

  handleDisconnect(client: any) {
    Logger.log(
      `{${client.request.user.sub}, ${client.request.user.username}} DISCONNECTED`,
    );
  }
}
