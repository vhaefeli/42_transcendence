import { Body, Controller, Logger, Post, Request } from '@nestjs/common';
import { CreateChannelDto } from './create-channel.dto';
import { ChatService } from './chat.service';

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
}
