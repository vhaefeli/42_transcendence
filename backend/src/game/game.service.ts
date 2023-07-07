import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CancelGameDto } from './dto/cancelGame.dto';
import { PlayingGameDto } from '../player/dto/playingGame.dto';
import { env } from 'process';
import { isNativeError } from 'util/types';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}
  // ------------------------------------------------------------------------------------------------------
  // NewGame will be discarded, replaced by player/newBoth
  async newGame(id: number) {
    try {
      const game = await this.prisma.game.create({
        data: {
          initiatedById: id,
        },
        select: {
          id: true,
          initiatedById: true,
        },
      });
      return { game };
    } catch (e) {
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }
  // ------------------------------------------------------------------------------------------------------
  // Cancel game is planned to be the answer of the invitation, in case of NoP
  async cancelGame(id: number, cancelGameDto: CancelGameDto) {
    // ensure the user sub is the seq2 player
    const env_ok = await this.prisma.player.findFirst({
      where: {
        gameId: +cancelGameDto.gameId,
        playerId: +id,
        seq: 2,
      },
    });
    if (env_ok === null) {
      // Logger.log('env_ok null');
      throw new NotFoundException();
    } else if (env_ok.gameStatus != 'WAITING') {
      // Logger.log("env_ok.gameStatus != 'WAITING'");
      throw new NotFoundException();
    } else {
      try {
        //
        const result = await this.prisma.game.update({
          where: {
            id: +cancelGameDto.gameId,
          },
          data: {
            completed: true,
          },
        });
        const resultPlayer = await this.prisma.player.updateMany({
          where: {
            gameId: +cancelGameDto.gameId,
          },
          data: { gameStatus: 'ENDED' },
        });
        return { result };
      } catch (e) {
        // record not found
        if (e.code == 'P2025') throw new NotFoundException();
        if (e.code == 'ERROR') throw new NotFoundException();
        if (e?.code) Logger.error(e.code + ' ' + e.msg);
        else Logger.error(e);
      }
    }
  }
}
