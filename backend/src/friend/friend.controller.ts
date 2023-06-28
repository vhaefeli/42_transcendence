import {
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('user/friend')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Get('all')
  async findFriends(@Request() req: any) {
    return await this.friendService.getFriends(req.user.sub);
  }

  @Delete(':username')
  async removeFriendship(@Param() params: any, @Request() req: any) {
    await this.friendService.removeFriendship(req.user.sub, params.username);
  }

  @Post('invite/:username')
  async sendFriendshipInvitation(@Param() params: any, @Request() req: any) {
    if (req.user.username == params.username) throw new ConflictException();
    await this.friendService.createInvitation(req.user.sub, params.username);
    return;
  }

  @Get('invite/received')
  async getInvitations(@Request() req: any) {
    return await this.friendService.findInvitationsReceived(req.user.sub);
  }

  @Get('invite/sent')
  async getInvitationSent(@Request() req: any) {
    return await this.friendService.findInvitationsSent(req.user.sub);
  }

  @Post('invite/accept/:from_username')
  async acceptInvitation(@Param() params: any, @Request() req: any) {
    await this.friendService.acceptInvitation(
      params.from_username,
      req.user.sub,
    );
  }

  @Delete('invite/:from_username')
  async refuseInvitation(@Param() params: any, @Request() req: any) {
    await this.friendService.refuseInvitation(
      params.from_username,
      req.user.sub,
    );
  }
}
