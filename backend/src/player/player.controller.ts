import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Post('new')
  async newPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    console.log('NewPlayer for gameId:', createPlayerDto.gameId);
    console.log(
      'NewPlayer randomAssignation:',
      createPlayerDto.randomAssignation,
    );
    return await this.playerService.newPlayer(createPlayerDto);
  }

  @Patch('status')
  async updateStatus(@Body() updatePlayerDto: UpdatePlayerDto) {
    console.log('gameId :', updatePlayerDto.gameId);
    console.log('playerId :', updatePlayerDto.playerId);
    console.log('gameStatus: ', updatePlayerDto.gameStatus);
    return await this.playerService.updateStatus(updatePlayerDto);
  }

  @Get('invitedBy/:id')
  async invitedBy(@Param('id') playerId: string) {
    // console.log(playerId);
    return this.playerService.invitedBy(playerId);
  }
}
