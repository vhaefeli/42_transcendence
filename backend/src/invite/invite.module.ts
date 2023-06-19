import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
  controllers: [InviteController],
  providers: [InviteService],
  imports: [UserModule],
})
export class InviteModule {}
