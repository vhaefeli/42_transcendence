import { Body, Controller, Get, Request, Patch, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { CreateBothPlayerDto } from './dto/createBothPlayer.dto';
import { PlayingGameDto } from './dto/playingGame.dto';
import { UpdateCompletionDto } from './dto/updateCompletion.dto';
import { CancelGameDto } from './dto/cancelGame.dto';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Post('newBoth')
  async newBothPlayer(
    @Request() req: any,
    @Body() createPlayerDto: CreateBothPlayerDto,
  ) {
    // console.log(' ' + req.user.sub);
    return await this.playerService.newBothPlayer(
      req.user.sub,
      createPlayerDto,
    );
  }

  @Patch('start')
  async updateStart(@Request() req: any, @Body() updateDto: UpdatePlayerDto) {
    return await this.playerService.updateStart(req.user.sub, updateDto);
  }

  @Patch('completion')
  async updateCompletion(
    @Request() req: any,
    @Body() updateCompletionDto: UpdateCompletionDto,
  ) {
    return await this.playerService.updateCompletion(
      req.user.sub,
      updateCompletionDto,
    );
  }

  @Get('invitedBy')
  async invitedBy(@Request() req: any) {
    return this.playerService.invitedBy(req.user.sub);
  }

  @Get('log')
  async log(@Request() req: any) {
    return this.playerService.gameLog(req.user.sub);
  }

  @Patch('playing')
  async playingGame(
    @Request() req: any,
    @Body() playingGameDto: PlayingGameDto,
  ) {
    // console.log(req.user.sub);
    return await this.playerService.playingGame(req.user.sub, playingGameDto);
  }

  @Patch('cancel')
  async cancelGame(@Request() req: any, @Body() cancelGameDto: CancelGameDto) {
    return await this.playerService.cancelGame(req.user.sub, cancelGameDto);
  }

  @Post('random')
  async random(@Request() req: any) {
    return await this.playerService.random(req.user.sub);
  }
}
