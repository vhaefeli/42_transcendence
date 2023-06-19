import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { AvatarValidator } from './avatar.validator';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [AvatarService, AvatarValidator],
  controllers: [AvatarController],
  imports: [AuthModule, HttpModule],
  exports: [AvatarService],
})
export class AvatarModule {}
