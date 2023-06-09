import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  pretty_json(res: any) {
    return JSON.stringify(res, null, 2);
  }

  @Post(':username')
  async sendFriendshipInvitation(@Param() params: any, @Request() req: any) {
    await this.inviteService.createInvitation(req.user.sub, params.username);
    return;
  }

  @Get('view')
  async getInvitations(@Request() req: any) {
    return await this.inviteService.findInvitationsReceived(req.user.sub);
  }

  @Post('accept/:to_user/:from_user')
  async acceptInvitation(@Param() params: any) {
    const from_user = await this.inviteService.acceptInvitation(
      params.from_user,
      params.to_user,
    );
    if (from_user == null) return `No invitation with id ${params.id}`;
    return `Accepted invitation from ${from_user}`;
  }
}
