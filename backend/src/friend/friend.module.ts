import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [forwardRef(() => UserModule)],
  exports: [FriendService],
})
export class FriendModule {}
