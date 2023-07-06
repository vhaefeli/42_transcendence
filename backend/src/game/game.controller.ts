import { Body, Controller, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/createGame.dto';
import { CancelGameDto } from './dto/cancelGame.dto';

@Controller('game')
export class GameController {
  constructor(private gameservice: GameService) {}

  @Post('new')
  async newGame(@Body() createGameDto: CreateGameDto) {
    // console.log('newInitiated by id :', createGameDto.initiatedById);
    return await this.gameservice.newGame(createGameDto);
  }

  @Patch('cancel')
  async cancelGame(@Body() cancelGameDto: CancelGameDto) {
    console.log('gameId :', cancelGameDto.gameId);
    return await this.gameservice.cancelGame(cancelGameDto);
  }
}
