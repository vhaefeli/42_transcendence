import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateGameDto } from './dto/createGame.dto';
import { CancelGameDto } from './dto/cancelGame.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}
  async newGame(createGameDto: CreateGameDto) {
    try {
      const game = await this.prisma.game.create({
        data: {
          initiatedById: +createGameDto.initiatedById,
        },
        select: {
          id: true,
          initiatedById: true,
        },
      });
      return { game };
    } catch (e) {
      if (e.code == 'P2003') throw new NotFoundException();
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }

  async cancelGame(cancelGameDto: CancelGameDto) {
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
  }
}
