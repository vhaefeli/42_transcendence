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
  WsException,
} from '@nestjs/websockets';
import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from 'src/auth/auth.service';
import { WsGuard } from 'src/auth/ws.guard';

import { ChatService } from './chat.service';
import { ReceivingDmDto, SendingDmDto } from './dm-payloads.dto';
import {
  ReceivingChannelMessageDto,
  SendingChannelMessageDto,
} from './channel-message.dto';

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

  async findConnectedUserById(
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
    const save_message = this.chatService.SaveDirectMessage(
      client?.data.user.sub,
      payload.toId,
      payload.message,
      new Date(payload.date),
    );
    const destination = this.findConnectedUserById(payload.toId);

    await Promise.all([destination, save_message]);

    Logger.log(
      `${new Date(payload.date)}: ${client.data?.user.sub} -> ${
        payload.toId
      } "${payload.message}"`,
    );

    const sending_msg: SendingDmDto = {
      id: (await save_message).id,
      fromId: client?.data.user.sub,
      toId: payload.toId,
      message: payload.message,
      date: payload.date,
    };
    if (await destination)
      this.server.to((await destination).id).emit('dm', sending_msg);
    return await save_message;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('channelHistory')
  async sendChannelHistory(@ConnectedSocket() client: Socket) {
    try {
      const channel_messages = this.chatService.GetMyChannelMessages(
        client.data.user.sub,
      );
      for (const m of await channel_messages) {
        const msg: SendingChannelMessageDto = {
          ...m,
          date: new Date(m.date).getTime(),
        };
        client.emit('channelHistory', msg);
      }
    } catch (error) {
      if (error?.code) Logger.error(`${error.code}, ${error.message}`);
      throw error;
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('channel')
  async sendChannelMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReceivingChannelMessageDto,
  ) {
    if (
      !(await this.chatService.IsUserInChannel(
        client.data.user.sub,
        payload.channelId,
      ))
    )
      throw new WsException('User is not in channel');
    const save_message = await this.chatService.SaveChannelMessage(
      client.data.user.sub,
      payload.channelId,
      payload.message,
      new Date(payload.date),
    );
    const msg: SendingChannelMessageDto = {
      id: save_message.id,
      senderId: client.data.user.sub,
      ...payload,
    };
    client.to(payload.channelId.toString()).emit('channel', msg);
    return save_message;
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

  @UseGuards(WsGuard)
  @SubscribeMessage('dmHistory')
  async sendDmHistory(@ConnectedSocket() client: any) {
    try {
      const direct_messages = this.chatService.GetMyDirectMessages(
        client.data.user.sub,
      );

      for (const dm of await direct_messages) {
        const msg: SendingDmDto = {
          ...dm,
          date: new Date(dm.date).getTime(),
        };
        client.emit('dmHistory', msg);
      }
    } catch (error) {
      if (error?.code) Logger.error(`${error.code}, ${error.message}`);
      throw error;
    }
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const payload = await this.authService.socketConnectionAuth(
        client.handshake.auth.token,
      );
      client.request['user'] = payload;
      client.data['user'] = payload;
      
      const channels = this.chatService.GetMyChannels(payload.sub);

      await Promise.all([
        new Promise(async (resolve) => {
          (await channels).forEach((channel) => {
            //Logger.log(`${payload.username} joins ${channel.name}`);
            client.join(channel.id.toString());
          });
          resolve;
        }),
      ]);
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
