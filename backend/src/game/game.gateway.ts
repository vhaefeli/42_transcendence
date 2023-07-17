import {
  BaseWsExceptionFilter,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
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
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  Inject,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
  forwardRef,
} from '@nestjs/common';
import { GameService } from './game.service';
import { ConnectToGameDto } from './dto/connect-to-game.dto';
import { UpdateActionGameDto } from './dto/update-action-game.dto';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@Catch(BadRequestException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const properException = new WsException(exception.getResponse());
    super.catch(properException, host);
  }
}

@UseFilters(BadRequestTransformationFilter)
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

  @UsePipes(new ValidationPipe())
  @UseGuards(WsGuard)
  @SubscribeMessage('connectToGame')
  async connectToGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() connectToGameDto: ConnectToGameDto,
  ) {
    try {
      await this.gameService.connectToGame(
        connectToGameDto.gameId,
        socket.data.user.sub,
        socket,
      );
    } catch (e) {
      if (this.debug) Logger.debug(e);
      throw e;
    }
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(WsGuard)
  @SubscribeMessage('ready')
  async markReadyToStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() connectToGameDto: ConnectToGameDto,
  ) {
    await this.gameService.playerIsReadyToStart(
      connectToGameDto.gameId,
      socket.data.user.sub,
    );
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(WsGuard)
  @SubscribeMessage('action')
  updatePlayerAction(
    @ConnectedSocket() socket: Socket,
    @MessageBody() updateActionGameDto: UpdateActionGameDto,
  ) {
    this.gameService.updateAction(
      updateActionGameDto.gId,
      socket.data.user.sub,
      updateActionGameDto.a,
    );
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('testLag')
  testLag(@MessageBody() body: { client: number }) {
    return { client: body.client, server: new Date().getTime() };
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

  async findConnectedUserById(
    id: number,
  ): Promise<Array<RemoteSocket<DefaultEventsMap, any>> | undefined> {
    const userSockets = new Array<RemoteSocket<DefaultEventsMap, any>>();
    for (const socket of await this.server.fetchSockets()) {
      if (socket.data?.user.sub === id) userSockets.push(socket);
    }
    return userSockets;
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
