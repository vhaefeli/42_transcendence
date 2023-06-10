import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AvatarModule } from 'src/avatar/avatar.module';
import { UserController } from './user.controller';
import { UsersService } from './users.service';

@Module({
  imports: [forwardRef(() => AuthModule), AvatarModule],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UserModule {}
