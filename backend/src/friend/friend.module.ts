import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [UserModule],
})
export class FriendModule {}
