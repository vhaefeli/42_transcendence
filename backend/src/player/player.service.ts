import {
  Injectable,
  Logger,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { parse } from 'path';
import { Game, Player } from '@prisma/client';
import { CreateBothPlayerDto } from './dto/createBothPlayer.dto';
import { PlayingGameDto } from './dto/playingGame.dto';

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

  async newBothPlayer(
    playerId: string,
    createBothPlayerDto: CreateBothPlayerDto,
  ) {
    // ensure playerId is not equal to the opponentId
    if (+playerId == createBothPlayerDto.opponentId) {
      throw new UnauthorizedException("Opponent can't be the player");
    }
    // create the game with initiatedBy = sub
    const game = await this.prisma.game.create({
      data: {
        initiatedById: +playerId,
      },
      select: {
        id: true,
      },
    });
    // create the players
    try {
      const player1 = await this.prisma.player.create({
        data: {
          gameId: game.id,
          seq: 1,
          playerId: +playerId,
          mode: createBothPlayerDto.mode,
        },
        select: {
          id: true,
        },
      });
      const player2 = await this.prisma.player.create({
        data: {
          gameId: game.id,
          seq: 2,
          playerId: +createBothPlayerDto.opponentId,
          mode: createBothPlayerDto.mode,
        },
        select: {
          id: true,
        },
      });
      const newGameId: number = game.id;
      return { newGameId };
    } catch (e) {
      if (e.code == 'P2003') throw new NotFoundException();
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
    const idnum: number = +playerId;
    Logger.log('playerID selected:' + idnum);
    const result = await this.prisma.$queryRaw`
      SELECT "Game".id "gameId", "User".username, "User"."level"
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
    // Logger.log(result);
    return result;
  }
  // ------------------------------------------------------------------------------------------------------
  // Playing game is planned to be the answer of the invitation, in case of OK
  async playingGame(id: number, playingGameDto: PlayingGameDto) {
    // ensure the user sub is the seq2 player
    const env_ok = await this.prisma.player.findFirst({
      where: {
        gameId: +playingGameDto.gameId,
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
        const resultPlayer = await this.prisma.player.updateMany({
          where: {
            gameId: +playingGameDto.gameId,
          },
          data: { gameStatus: 'PLAYING', score4stat: true },
        });
        return { resultPlayer };
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
