import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
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
import { ChannelChangeDto } from './dto/channel-change.dto';
import { ChannelJoinDto } from './dto/channel-join.dto';
import { MyChannelAdminDto } from './dto/myChannelAdmin.dto';
import { MyChannelMutedDto } from './dto/myChannelMuted.dto';
import { MyChannelBannedDto } from './dto/myChannelBanned.dto';
import { ChannelRemoveMemberDto } from './dto/channel-remove-member.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('channel/new')
  async createChannel(
    @Request() req: any,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return await this.chatService.CreateChannel(req.user.sub, createChannelDto);
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

  // --------------------------------------------------------------------
  @Get('channel/members/:channelId')
  async getMyChannelMembers(
    @Param('channelId') channelId: number,
    @Request() req: any,
  ) {
    return await this.chatService.FindMyChannelMembers(req.user.sub, channelId);
  }

  @Get('channel/admin/:channelId')
  async getMyChannelAdmin(
    @Param('channelId') channelId: number,
    @Request() req: any,
  ) {
    return await this.chatService.FindMyChannelAdmin(req.user.sub, channelId);
  }

  @Get('channel/muted/:channelId')
  async getMyChannelMuted(
    @Param('channelId') channelId: number,
    @Request() req: any,
  ) {
    return await this.chatService.FindMyChannelMutted(req.user.sub, channelId);
  }

  @Get('channel/banned/:channelId')
  async getMyChannelBanned(
    @Param('channelId') channelId: number,
    @Request() req: any,
  ) {
    return await this.chatService.FindMyChannelBanned(req.user.sub, channelId);
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

  @Patch('channel/member/remove')
  async channelRemoveMember(
    @Request() req: any,
    @Body() channelRemoveMemberDto: ChannelRemoveMemberDto,
  ) {
    await this.chatService.ChannelRemoveMember(
      channelRemoveMemberDto,
      req.user.sub,
    );
  }

  @Patch('channel/change')
  async channelchange(
    @Request() req: any,
    @Body() channelChangeDto: ChannelChangeDto,
  ) {
    await this.chatService.channelchange(channelChangeDto, req.user.sub);
  }

  @Patch('channel/join')
  async channeljoin(
    @Request() req: any,
    @Body() channeljoinDto: ChannelJoinDto,
  ) {
    await this.chatService.channelJoin(channeljoinDto, req.user.sub);
  }
}
