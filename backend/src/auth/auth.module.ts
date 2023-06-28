import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtConfigService } from './jwt.service';
import { WsGuard } from './ws.guard';
import { TwilioModule } from 'nestjs-twilio';
import { TwilioConfigService } from './twilio.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtConfigService,
    AuthGuard,
    WsGuard,
    TwilioConfigService,
  ],
  imports: [
    forwardRef(() => UserModule),
    HttpModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, global: true }),
    TwilioModule.forRootAsync({ useClass: TwilioConfigService }),
  ],
  exports: [AuthGuard, AuthService, WsGuard],
})
export class AuthModule {}
