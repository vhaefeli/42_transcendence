import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AvatarModule } from 'src/avatar/avatar.module';
import { FriendModule } from 'src/friend/friend.module';
import { UserController } from './user.controller';
import { UsersService } from './users.service';
import { StatusModule } from 'src/status/status.module';
import { BlockModule } from 'src/block/block.module';
import { AutoPopulateDbModule } from 'src/auto-populate-db/auto-populate-db.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    AvatarModule,
    forwardRef(() => FriendModule),
    StatusModule,
    forwardRef(() => BlockModule),
    AutoPopulateDbModule,
  ],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UserModule {}
