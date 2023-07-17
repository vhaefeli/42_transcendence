import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { StatusGateway } from './status.gateway';
import { ConfigService } from '@nestjs/config';
import { ConnectedPlayers } from 'src/game/game.entity';
import { UsersService } from 'src/user/users.service';
import { GameService } from 'src/game/game.service';
import { game_status } from '@prisma/client';

export enum StatusType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  INGAME = 'INGAME',
}

@Injectable()
export class StatusService {
  private online_threshold: number;
  constructor(
    private readonly statusGateway: StatusGateway,
    private gameService: GameService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    this.online_threshold =
      +configService.get<number>('SOCKET_ONLINE_THRESHOLD_S') * 1000;
  }

  async isOnline(user: { id?: number; username?: string }): Promise<boolean> {
    for (const socket of await this.statusGateway.server.fetchSockets()) {
      if (
        (user?.id && user?.id === socket.data?.user?.sub) ||
        (user?.username && user?.username === socket.data?.user?.username)
      ) {
        const time_elapsed = new Date(
          new Date().getTime() - socket.data.last_online?.getTime(),
        );
        if (time_elapsed.getTime() <= this.online_threshold) return true;
        break;
      }
    }
    return false;
  }

  async isIngame(user: { id?: number; username?: string }): Promise<boolean> {
    let id: number;
    if (user?.username === undefined) id = user.id;
    else id = await this.usersService.getId(user.username);
    const game_id = ConnectedPlayers.get(id);
    if (game_id === undefined) return false;
    if (this.gameService.getStatusOfGame(game_id)) return true;
    return false;
  }

  async getStatus(user: {
    id?: number;
    username?: string;
  }): Promise<StatusType> {
    if (await this.isIngame(user)) return StatusType.INGAME;
    if (await this.isOnline(user)) return StatusType.ONLINE;
    return StatusType.OFFLINE;
  }
}
