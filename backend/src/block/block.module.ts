import { forwardRef, Module } from '@nestjs/common';
import { FriendModule } from 'src/friend/friend.module';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';

@Module({
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService],
  imports: [forwardRef(() => FriendModule)],
})
export class BlockModule {}
