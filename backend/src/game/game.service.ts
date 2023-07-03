import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateGameDto } from './dto/createGame.dto';
import { Game } from '@prisma/client';

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
      throw new NotFoundException();
      Logger.error(e);
    }
  }
}
