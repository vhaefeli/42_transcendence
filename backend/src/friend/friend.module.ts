import { forwardRef, Module } from '@nestjs/common';
import { BlockModule } from 'src/block/block.module';
import { UserModule } from 'src/user/user.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { StatusModule } from 'src/status/status.module';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => BlockModule),
    StatusModule,
  ],
  exports: [FriendService],
})
export class FriendModule {}
