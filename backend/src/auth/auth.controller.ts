import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { Public } from './auth.guard';
import { AuthService } from './auth.service';
import { Login42ApiDto } from './Login42Api.dto';
import { SignInDto } from './sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.SignIn(signInDto.username, signInDto.password);
  }

  @Public()
  @Post('42api')
  async registerLogin42(@Body() login42ApiDto: Login42ApiDto) {
    return await this.authService.login42Api(
      login42ApiDto.code,
      login42ApiDto.state,
    );
  }

  @Get('info')
  testAuth(@Request() req: any) {
    return req.user;
  }
}
