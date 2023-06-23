import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtConfigService } from './jwt.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtConfigService, AuthGuard],
  imports: [
    forwardRef(() => UserModule),
    HttpModule,
    JwtModule.registerAsync({ useClass: JwtConfigService, global: true }),
  ],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
