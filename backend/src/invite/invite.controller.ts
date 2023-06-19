import {
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  pretty_json(res: any) {
    return JSON.stringify(res, null, 2);
  }

  @Post(':username')
  async sendFriendshipInvitation(@Param() params: any, @Request() req: any) {
    if (req.user.username == params.username) throw new ConflictException();
    await this.inviteService.createInvitation(req.user.sub, params.username);
    return;
  }

  @Get('view')
  async getInvitations(@Request() req: any) {
    return await this.inviteService.findInvitationsReceived(req.user.sub);
  }

  @Post('accept/:from_username')
  async acceptInvitation(@Param() params: any, @Request() req: any) {
    await this.inviteService.acceptInvitation(
      params.from_username,
      req.user.sub,
    );
    return;
  }
}
