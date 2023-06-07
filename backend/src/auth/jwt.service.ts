import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService {
  constructor(private readonly configService: ConfigService) {}

  public createJwtOptions(): JwtModuleOptions {
    return {
      global: true,
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      signOptions: { expiresIn: '7d' },
    };
  }
}
