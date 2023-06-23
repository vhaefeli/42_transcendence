import {
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('user/friend')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Post(':username')
  async sendFriendshipInvitation(@Param() params: any, @Request() req: any) {
    if (req.user.username == params.username) throw new ConflictException();
    await this.friendService.createInvitation(req.user.sub, params.username);
    return;
  }

  @Get('view')
  async getInvitations(@Request() req: any) {
    return await this.friendService.findInvitationsReceived(req.user.sub);
  }

  @Post('accept/:from_username')
  async acceptInvitation(@Param() params: any, @Request() req: any) {
    await this.friendService.acceptInvitation(
      params.from_username,
      req.user.sub,
    );
    return;
  }
}
