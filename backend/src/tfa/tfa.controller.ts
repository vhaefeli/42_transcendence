import { Body, Controller, Patch, Request } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { Enable2FADto } from './enable-2fa.dto';

@Controller('auth/2fa')
export class TfaController {
  constructor(private tfaService: TfaService) {}

  @Patch('enable')
  async register2FA(@Request() req: any, @Body() enable2FADto: Enable2FADto) {
    return await this.tfaService.register2FA(req.user.sub, enable2FADto.email);
  }
}
