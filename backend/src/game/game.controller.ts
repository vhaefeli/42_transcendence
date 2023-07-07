import { Body, Controller, Patch, Post, Request } from '@nestjs/common';
import { GameService } from './game.service';
import { CancelGameDto } from './dto/cancelGame.dto';
import { PlayingGameDto } from './dto/playingGame.dto';

@Controller('game')
export class GameController {
  constructor(private gameservice: GameService) {}

  // create new record in games, only parameter required is sub
  @Post('new')
  async newGame(@Request() req: any) {
    console.log(req.user.sub);
    return await this.gameservice.newGame(req.user.sub);
  }

  // used by Nop on game invitation
  @Patch('cancel')
  async cancelGame(@Request() req: any, @Body() cancelGameDto: CancelGameDto) {
    console.log(req.user.sub);
    return await this.gameservice.cancelGame(req.user.sub, cancelGameDto);
  }

  @Patch('playing')
  async playingGame(
    @Request() req: any,
    @Body() playingGameDto: PlayingGameDto,
  ) {
    console.log(req.user.sub);
    return await this.gameservice.playingGame(req.user.sub, playingGameDto);
  }
}
