import { Body, Controller, Get, Request, Patch, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { CreateBothPlayerDto } from './dto/createBothPlayer.dto';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Post('new')
  async newPlayer(
    @Request() req: any,
    @Body() createPlayerDto: CreatePlayerDto,
  ) {
    // console.log('NewPlayer for gameId:', createPlayerDto.gameId);
    // console.log(
    //   'NewPlayer randomAssignation:',
    //   createPlayerDto.randomAssignation,
    // );
    return await this.playerService.newPlayer(createPlayerDto);
  }

  @Post('newBoth')
  async newBothPlayer(
    @Request() req: any,
    @Body() createPlayerDto: CreateBothPlayerDto,
  ) {
    return await this.playerService.newBothPlayer(
      req.user.sub,
      createPlayerDto,
    );
  }

  @Patch('status')
  async updateStatus(@Body() updatePlayerDto: UpdatePlayerDto) {
    // console.log('gameId :', updatePlayerDto.gameId);
    // console.log('playerId :', updatePlayerDto.playerId);
    // console.log('gameStatus: ', updatePlayerDto.gameStatus);
    return await this.playerService.updateStatus(updatePlayerDto);
  }

  @Get('invitedBy')
  async invitedBy(@Request() req: any) {
    // console.log(req.user.sub);
    return this.playerService.invitedBy(req.user.sub);
  }
}
