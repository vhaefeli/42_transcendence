import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtConfigService } from './jwt.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtConfigService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({ useClass: JwtConfigService, global: true }),
  ],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
