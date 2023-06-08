import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { Public } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.SignIn(signInDto.username, signInDto.password);
  }

  @Get('info')
  testAuth(@Request() req: any) {
    return req.user;
  }
}
