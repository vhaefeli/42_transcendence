import { ConfigurableModuleOptionsFactory, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioModuleOptions } from 'nestjs-twilio';

@Injectable()
export class TwilioConfigService
  implements ConfigurableModuleOptionsFactory<TwilioModuleOptions, 'create'>
{
  constructor(private readonly configService: ConfigService) {}

  create(): TwilioModuleOptions {
    return {
      accountSid: this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      authToken: this.configService.get<string>('TWILIO_TOKEN'),
    };
  }

  public createModuleOptions(): TwilioModuleOptions {
    return {
      accountSid: this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      authToken: this.configService.get<string>('TWILIO_TOKEN'),
    };
  }

  public createTwilioOptions(): TwilioModuleOptions {
    return {
      accountSid: this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      authToken: this.configService.get<string>('TWILIO_TOKEN'),
    };
  }
}
