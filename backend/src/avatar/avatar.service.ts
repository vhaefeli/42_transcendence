import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class AvatarService {
  constructor(private readonly configService: ConfigService) {}
  async uploadAvatar(user_id: number, file: Express.Multer.File) {
    const avatar_url = join(
      this.configService.get<string>('SERVER_HOSTNAME'),
      'avatar',
      file.filename,
    );
    return avatar_url;
  }
}
