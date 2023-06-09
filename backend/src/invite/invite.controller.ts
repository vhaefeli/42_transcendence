import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post(':username')
  async friendshipInvitation(@Param() params: any, @Request() req: any) {
    await this.inviteService.createInvitation(req.user.sub, params.username);
    return;
  }

  @Get(':user')
  async getInvitation(@Param() params: any) {
    const res = await this.inviteService.findInvitationsReceived(params.user);

    if (res == null) return `User ${params.user} does not exist`;
    return (
      `Pending invitations for user ${params.user}:\n` +
      JSON.stringify(res, null, 4)
    );
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
