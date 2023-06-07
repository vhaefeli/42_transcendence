import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FriendshipInvitationDto } from './friendship-invitation.dto';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post()
  async friendshipInvitation(
    @Body() friendshipInvitationDto: FriendshipInvitationDto,
  ) {
    this.inviteService.createInvitation(
      friendshipInvitationDto.from_username,
      friendshipInvitationDto.to_username,
    );
    return `Friendship invitation sent to ${friendshipInvitationDto.to_username}`;
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
