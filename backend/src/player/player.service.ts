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
import { game_status, level_type } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}
  // ------------------------------------------------------------------------------------------------------
  // create the game with the 2 players from the custom game entry
  async newBothPlayer(
    playerId: number,
    createBothPlayerDto: CreateBothPlayerDto,
  ) {
    // ensure playerId is not equal to the opponentId
    if (playerId == createBothPlayerDto.opponentId) {
      throw new UnauthorizedException("Opponent can't be the player");
    }
    // ensure the opponenetId is existing
    const user = await this.prisma.user.findFirst({
      where: {
        id: createBothPlayerDto.opponentId,
      },
    });
    if (user == null) {
      throw new UnauthorizedException('Opponent must exist');
    }
    // create the game with initiatedBy = sub
    const game = await this.prisma.game.create({
      data: {
        initiatedById: playerId,
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
          playerId: playerId,
          mode: createBothPlayerDto.mode,
          levelAtPlay: (await this.getLevelAtPlay(playerId)).newLevelAtPlay,
        },
        select: {
          id: true,
        },
      });
      const player2 = await this.prisma.player.create({
        data: {
          gameId: game.id,
          seq: 2,
          playerId: createBothPlayerDto.opponentId,
          mode: createBothPlayerDto.mode,
          levelAtPlay: (
            await this.getLevelAtPlay(createBothPlayerDto.opponentId)
          ).newLevelAtPlay,
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
  async updateStart(playerId: number, updatePlayerDto: UpdatePlayerDto) {
    let nbUpdate: number = 0;
    try {
      const playerUpdate = await this.prisma.player.updateMany({
        where: {
          gameId: updatePlayerDto.gameId,
          playerId: playerId,
          gameStatus: 'PLAYING',
        },
        data: {
          score4stat: true,
        },
      });
      if (playerUpdate.count !== 1) {
        throw new NotFoundException();
      } else {
        nbUpdate = 1;
        return { Start: 'OK' };
      }
    } catch (e) {
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      if (nbUpdate == 0) throw new NotFoundException();
      else Logger.error(e);
    }
  }
  // ------------------------------------------------------------------------------------------------------
  //
  async updateCompletion(
    playerId: number,
    updateCompletionDto: UpdateCompletionDto,
  ) {
    let nbUpdate: number = 0;
    if (updateCompletionDto.score > 3) {
      throw new UnauthorizedException('Max score is 3');
    }
    try {
      const playerUpdate = await this.prisma.player.updateMany({
        where: {
          gameId: updateCompletionDto.gameId,
          playerId: playerId,
          gameStatus: 'PLAYING',
          score4stat: true,
        },
        data: {
          score: updateCompletionDto.score,
          gameStatus: 'ENDED',
        },
      });
      const gameUpdate = await this.prisma.game.update({
        where: {
          id: updateCompletionDto.gameId,
        },
        data: {
          completed: true,
        },
      });
      // definition des elements a ajouter au user
      // Rank = somme de toutes les jeux victorieux
      let newRank = 0;
      if (updateCompletionDto.score >= 2) {
        newRank = 1;
      }
      // 1 match = toutes les parties gagnées (donc les 3 parties du jeu)
      let newNbMatch = 0;
      if (updateCompletionDto.score == 3) {
        newNbMatch = 1;
      }
      // read the usewr for grapping the required values
      const ExistingUser = await this.prisma.user.findFirst({
        where: {
          id: playerId,
        },
      });
      // treat the level
      let newLevel: level_type;
      // Après les 2 premières parties sans influence du score, passage à Debutant
      if (ExistingUser.nbGames == 1) {
        newLevel = 'BEGINNER';
      }
      // Après 3 parties victorieuses, passage à Moyen
      if (ExistingUser.nbGames + newNbMatch == 3) {
        newLevel = 'INTERMEDIATE';
      }
      // Après 5 parties victorieuses, passage à Expert
      if (ExistingUser.nbGames + newNbMatch == 5) {
        newLevel = 'EXPERT';
      }
      const updateUser = await this.prisma.user.update({
        where: {
          id: playerId,
        },
        data: {
          level: newLevel,
          rank: ExistingUser.rank + newRank,
          nbMatch: ExistingUser.nbMatch + newNbMatch,
          nbGames: ExistingUser.nbGames + 1,
        },
      });
      if (playerUpdate.count !== 1) {
        throw new NotFoundException();
      } else {
        nbUpdate = 1;
        return { Completion: 'OK' };
      }
    } catch (e) {
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      if (nbUpdate == 0) throw new NotFoundException();
      else Logger.error(e);
    }
  }
  // ------------------------------------------------------------------------------------------------------
  // list all invitation received by the connected user
  async invitedBy(playerId: number) {
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
                AND "Player"."playerId" = ${playerId}
            )
        `;
    return game;
  }

  // ------------------------------------------------------------------------------------------------------
  // list all games played by the connected user
  async gameLog(playerId: number) {
    const gameslog = await this.prisma.$queryRaw`
    select "Game".date , 
    CASE 
    WHEN "Player".score > p2.score THEN 'Won against '
    WHEN "Player".score < p2.score THEN  'Lost against ' 
    END 
    ||
    u2.username
    ||
    ' ('
    ||
    CASE 
    WHEN p2."levelAtPlay" = 'INITIATION' THEN 'Potato'
    WHEN p2."levelAtPlay" = 'BEGINNER' THEN  'Pickle' 
    WHEN p2."levelAtPlay" = 'INTERMEDIATE' THEN  'Pineapple' 
    WHEN p2."levelAtPlay" = 'EXPERT' THEN  'Pitaya' 
    END
    ||
    ')' "Result"
    from  "Player", "Game", "User", "Player" p2, "User" u2
    where 
    "Player"."gameId" = "Game".id
    and "Player"."playerId" = "User".id
    and "Player"."playerId" =  ${playerId}
    and "Player".score4stat = true
    and "Player"."gameId" = p2."gameId"
    and "Player".seq <> p2.seq
    and p2."playerId" = u2.id
    order by "Game".date desc
      `;
    return gameslog;
  }

  // ------------------------------------------------------------------------------------------------------
  // Playing game is the answer of the invitation, in case of OK
  async playingGame(id: number, playingGameDto: PlayingGameDto) {
    // ensure the user sub is the seq2 player
    const env_ok = await this.prisma.player.findFirst({
      where: {
        gameId: playingGameDto.gameId,
        playerId: id,
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
            gameId: playingGameDto.gameId,
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
  // Cancel game is the answer of the invitation, in case of NoP
  async cancelGame(id: number, cancelGameDto: CancelGameDto) {
    // ensure the user sub is the seq2 player
    const env_ok = await this.prisma.player.findFirst({
      where: {
        gameId: cancelGameDto.gameId,
        playerId: id,
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
            id: cancelGameDto.gameId,
          },
          data: {
            completed: false,
          },
        });
        const resultPlayer = await this.prisma.player.updateMany({
          where: {
            gameId: cancelGameDto.gameId,
          },
          data: { gameStatus: 'ENDED' },
        });
        const resultReturned = 'Canceled';
        return { resultReturned };
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
    try {
      // identify if there is already a random player waiting for playing
      let game: any = (
        await this.prisma.game.findMany({
          where: {
            player: {
              every: {
                randomAssignation: true,
                gameStatus: game_status.WAITING,
              },
            },
          },
          select: {
            id: true,
            _count: { select: { player: true } },
          },
        })
      ).find((game) => game._count.player === 1);
      // determine if player1+game or player2 must be created
      if (game == null) {
        // Case : Create Game & Player 1-----------------------------------------
        // create the game with initiatedBy = sub
        game = await this.prisma.game.create({
          data: {
            initiatedById: playerId,
          },
          select: {
            id: true,
          },
        });
        // create the player 1
        await this.prisma.player.create({
          data: {
            gameId: game.id,
            seq: 1,
            playerId: playerId,
            // mode: 'INTERMEDIATE',
            randomAssignation: true,
            levelAtPlay: (await this.getLevelAtPlay(playerId)).newLevelAtPlay,
          },
          select: {
            id: true,
            gameId: true,
          },
        });
      } else {
        // Case : Create Player 2 -----------------------------------------------
        // update player1 to avoid re-attribution to random
        // create the player 2
        await this.prisma.player.create({
          data: {
            gameId: game.id,
            seq: 2,
            playerId: playerId,
            // mode: 'INTERMEDIATE',
            gameStatus: game_status.WAITING,
            randomAssignation: true,
            levelAtPlay: (await this.getLevelAtPlay(playerId)).newLevelAtPlay,
          },
          select: {
            id: true,
            gameId: true,
          },
        });
      }
      return { gameId: game.id };
    } catch (e) {
      // record not created as gameId & playerId are not unique.
      if (e.code == 'P2002') throw new NotFoundException();
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }

  async getLevelAtPlay(playerId: number): Promise<{ newLevelAtPlay: string }> {
    try {
      const CurrentUserlevel = await this.prisma.user.findUnique({
        where: {
          id: playerId,
        },
      });
      const newLevelAtPlay: string = CurrentUserlevel.level;
      return { newLevelAtPlay };
    } catch (e) {
      if (e.code == 'P2002') throw new NotFoundException();
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }
}
