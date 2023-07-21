import { Injectable } from '@nestjs/common';

import { StatusGateway } from './status.gateway';
import { ConfigService } from '@nestjs/config';

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

  async getStatus(user: {
    id?: number;
    username?: string;
  }): Promise<StatusType> {
    if (await this.isOnline(user)) return StatusType.ONLINE;
    return StatusType.OFFLINE;
  }
}
