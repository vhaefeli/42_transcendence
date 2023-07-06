import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { parse } from 'path';
import { Game, Player } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async newPlayer(createPlayerDto: CreatePlayerDto) {
    try {
      const player = await this.prisma.player.create({
        data: {
          gameId: +createPlayerDto.gameId,
          seq: +createPlayerDto.seq,
          playerId: +createPlayerDto.playerId,
          randomAssignation:
            String(createPlayerDto.randomAssignation).toLowerCase() === 'true',
        },
        select: {
          id: true,
        },
      });
      return { player };
    } catch (e) {
      if (e.code == 'P2003') throw new NotFoundException();
      if (e.code == 'P2002')
        throw new UnauthorizedException('Player already associated to a game');
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }
  //

  async updateStatus(updatePlayerDto: UpdatePlayerDto) {
    const playerUpdate = await this.prisma.player.update({
      where: {
        gameId_playerId: {
          gameId: +updatePlayerDto.gameId,
          playerId: +updatePlayerDto.playerId,
        },
      },
      data: {
        //   WAITING PLAYING  ENDED
        gameStatus: updatePlayerDto.gameStatus,
      },
    });
    return [updatePlayerDto.gameStatus];
  }

  async invitedBy(playerId: string) {
    // const result = await this.prisma.player.findMany({
    //   where: { playerId: +playerId, seq: 2 },
    //   select: {
    //     id: true,
    //     gameId: true,
    //     seq: true,
    //     playerId: true,

    const idnum: number = +playerId;
    Logger.log('playerID selected:' + idnum);
    const result = await this.prisma.$queryRaw`
      SELECT "Game".id, "User".username, "User"."level"
      FROM "Game", "Player", "User"
      WHERE "Player"."gameId" = "Game".id
        AND "Game".completed = 'false'
        AND "Player".seq = 1
        AND "Player"."playerId" = "User".id
        AND "Game".id IN (
          SELECT "Player"."gameId"
          FROM "Player"
          WHERE "Player".seq = 2
            AND "Player"."playerId" = ${idnum}
        )
    `;
    Logger.log(result);
    return result;
  }
}
