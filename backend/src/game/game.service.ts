import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

class Player {
  userId: number;
  socket: Socket;
}

@Injectable()
export class GameService {
  //private readonly frame_time = 10 + 2 / 3;
  private readonly frame_time = 1000;
  private connected_players: Array<Player>;
  constructor() {
    this.connected_players = new Array<Player>();
    Logger.debug(this.connected_players === undefined);
    setInterval(this.gameLoop.bind(this), this.frame_time);
  }

  connect(userId: number, socket: Socket) {
    if (!this.isConnected(socket.id))
      this.connected_players.push({ userId: userId, socket: socket });
  }

  isConnected(socket_id: string) {
    return this.connected_players.find(
      (player) => player.socket.id === socket_id,
    );
  }

  async gameLoop() {
    if (this.connected_players.length) {
      this.connected_players.forEach((player) => {
        Logger.log(`${player.userId}: ${player.socket.id}`);
      });
    }
    return;
  }
}
