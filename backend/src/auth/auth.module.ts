import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtConfigService } from './jwt.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    JwtConfigService,
    AuthService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    AuthModule,
    PrismaModule,
    JwtModule.registerAsync({ useClass: JwtConfigService }),
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
