import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/createGame.dto';

@Controller('game')
export class GameController {
  constructor(private gameservice: GameService) {}

  @Post('new')
  async newGame(@Body() createGameDto: CreateGameDto) {
    console.log('newInitiated by id :', createGameDto.initiatedById);
    return await this.gameservice.newGame(createGameDto);
  }
}
