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
import { RemoteSocket, Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsGuard } from 'src/auth/ws.guard';
import { ReceivingDmDto, SendingDmDto } from './dm-payloads.dto';
import { ChatService } from './chat.service';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { send } from 'process';

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
  constructor(
    configService: ConfigService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {
    this.debug = configService.get<string>('SOCKET_DEBUG') === 'true';
  }
  @WebSocketServer() server: Server;

  // References:
  // * Rooms:
  //    https://socket.io/docs/v3/rooms/
  // * Emit CheatSheet:
  //    https://socket.io/docs/v3/emit-cheatsheet/
  //
  // TODO:
  // * DM payload structure
  // * DM emit to single socket
  //
  // * Channel join room on connect
  // * Channel emit to room

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

  async findConnectedUser(
    id: number,
  ): Promise<RemoteSocket<DefaultEventsMap, any> | undefined> {
    for (const socket of await this.server.fetchSockets()) {
      if (socket.data?.user.sub === id) return socket;
    }
    return undefined;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('dm')
  async sendDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReceivingDmDto,
  ) {
    const sending_msg: SendingDmDto = {
      fromId: client?.data.user.sub,
      message: payload.message,
      date: new Date(payload.date).getTime(),
    };
    const save_message = this.chatService.SaveDirectMessage(
      sending_msg.fromId,
      payload.toId,
      payload.message,
      sending_msg.date,
    );
    const destination = this.findConnectedUser(payload.toId);

    Logger.log(
      `${new Date(sending_msg.date)}: ${client.data?.user.sub} -> ${
        payload.toId
      } "${payload.message}"`,
    );

    await Promise.all([destination, save_message]);

    if (await destination)
      this.server.to((await destination).id).emit(JSON.stringify(sending_msg));
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
