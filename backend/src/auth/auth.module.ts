import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtConfigService } from './jwt.service';
import { WsGuard } from './ws.guard';
import { TfaModule } from 'src/tfa/tfa.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtConfigService, AuthGuard, WsGuard],
  imports: [
    forwardRef(() => UserModule),
    HttpModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, global: true }),
    forwardRef(() => TfaModule),
  ],
  exports: [AuthGuard, AuthService, WsGuard],
})
export class AuthModule {}
