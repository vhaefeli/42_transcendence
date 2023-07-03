import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { FriendModule } from './friend/friend.module';
import { UserModule } from './user/user.module';
import { AvatarModule } from './avatar/avatar.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StatusModule } from './status/status.module';
import { BlockModule } from './block/block.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/avatar',
    }),
    PrismaModule,
    UserModule,
    FriendModule,
    AvatarModule,
    StatusModule,
    BlockModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
