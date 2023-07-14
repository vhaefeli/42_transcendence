import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChatService } from './chat.service';
import { ChannelAddMemberDto } from './dto/channel-add-member.dto';

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

  @Patch('channel/member/add')
  async channelAddMember(
    @Request() req: any,
    @Body() channelAddMemberDto: ChannelAddMemberDto,
  ) {
    await this.chatService.ChannelAddMember(channelAddMemberDto, req.user.sub);
  }
}
