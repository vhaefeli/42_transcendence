import { Injectable } from '@nestjs/common';

import { StatusGateway } from './status.gateway';

export enum StatusType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  INGAME = 'INGAME',
}

@Injectable()
export class StatusService {
  constructor(private readonly statusGateway: StatusGateway) {}

  async getStatus(user: {
    id?: number;
    username?: string;
  }): Promise<StatusType> {
    for (const socket of await this.statusGateway.server.fetchSockets()) {
      if (
        user?.id === socket.data.user.sub ||
        user?.username === socket.data.user.username
      )
        return StatusType.ONLINE;
    }
    return StatusType.OFFLINE;
  }
}
