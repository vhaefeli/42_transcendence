import { forwardRef, Module } from '@nestjs/common';
import { BlockModule } from 'src/block/block.module';
import { UserModule } from 'src/user/user.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [forwardRef(() => UserModule), BlockModule],
  exports: [FriendService],
})
export class FriendModule {}
