import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { AvatarValidator } from './avatar.validator';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [AvatarService, AvatarValidator],
  controllers: [AvatarController],
  imports: [AuthModule],
})
export class AvatarModule {}
