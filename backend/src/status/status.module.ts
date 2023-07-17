import { Module, forwardRef } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { StatusService } from './status.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { GameModule } from 'src/game/game.module';

@Module({
  controllers: [],
  providers: [StatusGateway, StatusService],
  exports: [StatusService],
  imports: [AuthModule, forwardRef(() => UserModule), GameModule],
})
export class StatusModule {}
