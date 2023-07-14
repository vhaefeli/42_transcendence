import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { GameService } from './game.service';

@Module({
  providers: [GameGateway, GameService],
  imports: [AuthModule],
})
export class GameModule {}
