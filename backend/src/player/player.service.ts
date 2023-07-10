import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { CreateBothPlayerDto } from './dto/createBothPlayer.dto';
import { PlayingGameDto } from './dto/playingGame.dto';
import { UpdateCompletionDto } from './dto/updateCompletion.dto';
import { CancelGameDto } from './dto/cancelGame.dto';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------------------------------------------------
  // create the game with the 2 players from the custom game entry
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

  // ------------------------------------------------------------------------------------------------------
  // when start is hit on the game, the game is considered as started, a stop will be an abandon
  async updateStart(playerId: string, updatePlayerDto: UpdatePlayerDto) {
    try {
      const playerUpdate = await this.prisma.player.updateMany({
        where: {
          gameId: +updatePlayerDto.gameId,
          playerId: +playerId,
          gameStatus: 'PLAYING',
        },
        data: {
          score4stat: true,
        },
      });
      if (playerUpdate.count != 1) {
        return { Start: 'Failed' };
      } else {
        return { Start: 'OK' };
      }
    } catch (e) {
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }

  // ------------------------------------------------------------------------------------------------------
  //
  async updateCompletion(
    playerId: string,
    updateCompletionDto: UpdateCompletionDto,
  ) {
    Logger.log('updateCompletion');
    if (+updateCompletionDto.score > 3) {
      throw new UnauthorizedException('Max score is 3');
    }
    try {
      const playerUpdate = await this.prisma.player.updateMany({
        where: {
          gameId: +updateCompletionDto.gameId,
          playerId: +playerId,
          gameStatus: 'PLAYING',
          score4stat: true,
        },
        data: {
          score: +updateCompletionDto.score,
          gameStatus: 'ENDED',
        },
      });
      const gameUpdate = await this.prisma.game.update({
        where: {
          id: +updateCompletionDto.gameId,
        },
        data: {
          completed: true,
        },
      });
      if (playerUpdate.count != 1) {
        return { Completion: 'Failed' };
      } else {
        return { Completion: 'OK' };
      }
    } catch (e) {
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }

  // ------------------------------------------------------------------------------------------------------
  // list all invitation received by the connected user
  async invitedBy(playerId: string) {
    const idnum: number = +playerId;
    const game = await this.prisma.$queryRaw`
      SELECT "Game".id "gameId", "User".username, "User"."level", "User"."avatar_url"
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
    return game;
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
          data: { gameStatus: 'PLAYING' },
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
            completed: false,
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

  // ------------------------------------------------------------------------------------------------------
  // manage the play against a random opponent
  async random(playerId: number) {
    // identify if there is already a random player waiting for playing
    const Candidate = await this.prisma.player.findMany({
      where: { gameStatus: 'WAITING', randomAssignation: true },
    });

    // determine if player1+game or player2 must be created
    if (Candidate[0] == null) {
      // Case : Create Game & Player 1-----------------------------------------
      // create the game with initiatedBy = sub
      const game = await this.prisma.game.create({
        data: {
          initiatedById: +playerId,
        },
        select: {
          id: true,
        },
      });
      // create the player 1
      const player1 = await this.prisma.player.create({
        data: {
          gameId: game.id,
          seq: 1,
          playerId: +playerId,
          // mode: 'INTERMEDIATE',
          randomAssignation: true,
        },
        select: {
          id: true,
          gameId: true,
        },
      });
      const gameId = player1.gameId;
      return { gameId };
    } else {
      // Case : Create Player 2 -----------------------------------------------
      // update player1 to avoid re-attribution to random

      try {
        // create the player 2
        const player2 = await this.prisma.player.create({
          data: {
            gameId: Candidate[0].gameId,
            seq: 2,
            playerId: +playerId,
            // mode: 'INTERMEDIATE',
            gameStatus: 'PLAYING',
            randomAssignation: false,
          },
          select: {
            id: true,
            gameId: true,
          },
        });
        const player1U = await this.prisma.player.updateMany({
          where: {
            gameId: Candidate[0].gameId,
            seq: 1,
            // mode: 'INTERMEDIATE',
            randomAssignation: true,
          },
          data: {
            gameStatus: 'PLAYING',
            randomAssignation: false,
          },
        });
        const gameId = player2.gameId;
        return { gameId };
      } catch (e) {
        // record not created as gameId & playerId are not unique.
        if (e.code == 'P2002') throw new NotFoundException();
        if (e?.code) Logger.error(e.code + ' ' + e.msg);
        else Logger.error(e);
      }
    }
  }
}
