import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChatService } from './chat.service';
import { ChannelAddMemberDto } from './dto/channel-add-member.dto';
import { ChannelAddAdminDto } from './dto/channel-add-admin.dto';
import { ChannelRemoveAdminDto } from './dto/channel-remove-admin.dto';
import { MyChannelMembersDto } from './dto/myChannelMembers.dto';
import { ChannelAddMutedDto } from './dto/channel-add-muted.dto';
import { ChannelRemoveMutedDto } from './dto/channel-remove-muted.dto';
import { ChannelRemoveBannedDto } from './dto/channel-remove-banned.dto';
import { ChannelAddBannedDto } from './dto/channel-add-banned.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('channel/new')
  async createChannel(
    @Request() req: any,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return await this.chatService.CreateChannel(createChannelDto, req.user.sub);
  }

  @Get('channel/all')
  async getAllChannels(@Request() req: any) {
    return await this.chatService.FindAllChannels(req.user.sub);
  }

  @Get('channel/all4select')
  async getAllChannelsList(@Request() req: any) {
    return await this.chatService.FindAllChannelsList(req.user.sub);
  }

  @Get('channel/myChannels')
  async getMyChannels(@Request() req: any) {
    return await this.chatService.FindMyChannels(req.user.sub);
  }

  @Get('channel/members')
  async getMyChannelMembers(
    @Request() req: any,
    @Body() myChannelMembersDto: MyChannelMembersDto,
  ) {
    return await this.chatService.FindMyChannelMembers(
      req.user.sub,
      myChannelMembersDto,
    );
  }

  @Patch('channel/member/add')
  async channelAddMember(
    @Request() req: any,
    @Body() channelAddMemberDto: ChannelAddMemberDto,
  ) {
    await this.chatService.ChannelAddMember(channelAddMemberDto, req.user.sub);
  }

  @Patch('channel/admin/add')
  async channelAddAdmin(
    @Request() req: any,
    @Body() channelAddAdminDto: ChannelAddAdminDto,
  ) {
    await this.chatService.ChannelAddAdmin(channelAddAdminDto, req.user.sub);
  }

  @Patch('channel/admin/remove')
  async channelRemoveAdmin(
    @Request() req: any,
    @Body() channelRemoveAdminDto: ChannelRemoveAdminDto,
  ) {
    await this.chatService.ChannelRemoveAdmin(
      channelRemoveAdminDto,
      req.user.sub,
    );
  }

  @Patch('channel/muted/add')
  async channelAddMuted(
    @Request() req: any,
    @Body() channelAddMutedDto: ChannelAddMutedDto,
  ) {
    await this.chatService.ChannelAddMuted(channelAddMutedDto, req.user.sub);
  }

  @Patch('channel/muted/remove')
  async channelRemoveMuted(
    @Request() req: any,
    @Body() channelRemoveMutedDto: ChannelRemoveMutedDto,
  ) {
    await this.chatService.ChannelRemoveMuted(
      channelRemoveMutedDto,
      req.user.sub,
    );
  }

  @Patch('channel/banned/add')
  async channelAddBanned(
    @Request() req: any,
    @Body() channelAddBannedDto: ChannelAddBannedDto,
  ) {
    await this.chatService.ChannelAddBanned(channelAddBannedDto, req.user.sub);
  }

  @Patch('channel/banned/remove')
  async channelRemoveBanned(
    @Request() req: any,
    @Body() channelRemoveBannedDto: ChannelRemoveBannedDto,
  ) {
    await this.chatService.ChannelRemoveBanned(
      channelRemoveBannedDto,
      req.user.sub,
    );
  }

  // @Patch('channel/change')
  // async channelchange(
  //   @Request() req: any,
  //   @Body() channelChangeDto: ChannelChangeDto,
  // ) {
  //   await this.chatService.channelchange(
  //     channelRemoveAdminDto,
  //     req.user.sub,
  //   );
  // }
}
