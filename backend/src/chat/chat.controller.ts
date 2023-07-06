import { Body, Controller, Logger, Post, Request } from '@nestjs/common';
import { CreateChannelDto } from './create-channel.dto';

@Controller('chat')
export class ChatController {
  @Post('channel/new')
  async createChannel(
    @Request() req: any,
    @Body() createChannelDto: CreateChannelDto,
  ) {
  }
}
