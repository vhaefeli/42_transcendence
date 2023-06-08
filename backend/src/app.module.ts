import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UsersService } from './users/users.service';
import { ConfigModule } from '@nestjs/config';
import { InviteService } from './invite/invite.service';
import { InviteController } from './invite/invite.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [AppController, UserController, InviteController],
  providers: [
    AppService,
    UsersService,
    InviteService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [UsersService],
})
export class AppModule {}
