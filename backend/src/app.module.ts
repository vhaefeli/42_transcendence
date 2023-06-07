import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UsersService } from './users/users.service';
import { ConfigModule } from '@nestjs/config';
import { InviteService } from './invite/invite.service';
import { InviteController } from './invite/invite.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController, UserController, InviteController],
  providers: [AppService, UsersService, InviteService],
})
export class AppModule {}
