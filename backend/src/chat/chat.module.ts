import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [AuthModule],
  controllers: [ChatController],
})
export class ChatModule {}
