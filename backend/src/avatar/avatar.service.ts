import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { v4 } from 'uuid';

@Injectable()
export class AvatarService {
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  avatarUrl(filename: string) {
    return join(
      this.configService.get<string>('SERVER_HOSTNAME'),
      'avatar',
      filename,
    );
  }

  //TODO delete previous avatar (if not default.jpg)
  async uploadAvatar(user_id: number, filename: string) {
    const avatar_url = await this.prisma.user.update({
      where: { id: user_id },
      data: {
        avatar_url: this.avatarUrl(filename),
      },
      select: { avatar_url: true },
    });
    return avatar_url;
  }

  async generateAvatar() {
    try {
      const filename = 'dicebear-' + v4().toString() + '.jpg';
      const res = await this.http.axiosRef({
        url: 'https://api.dicebear.com/6.x/thumbs/jpg?seed=' + filename,
        method: 'GET',
        responseType: 'stream',
      });
      const writer = createWriteStream(join('uploads', filename));
      res.data.pipe(writer);
      return this.avatarUrl(filename);
    } catch (e) {
      Logger.error(e);
      return this.avatarUrl('default.jpg');
    }
  }
}
