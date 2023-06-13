import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, unlink } from 'fs';
import { join, parse } from 'path';
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
      this.configService.get<string>('BACKEND_SERVER_URL'),
      'avatar',
      filename,
    );
  }

  async uploadAvatar(user_id: number, filename: string) {
    try {
      const old_avatar = parse(
        (
          await this.prisma.user.findUnique({
            where: { id: user_id },
            select: { avatar_url: true },
          })
        ).avatar_url,
      ).base;
      const avatar_url = await this.prisma.user.update({
        where: { id: user_id },
        data: {
          avatar_url: this.avatarUrl(filename),
        },
        select: { avatar_url: true },
      });

      if (old_avatar !== 'default.jpg')
        unlink(join('uploads', old_avatar), (err) => {
          if (err) Logger.error(err);
        });

      return avatar_url;
    } catch (e) {
      Logger.error(`AvatarService::uploadAvatar: ${e}`);
      throw new BadRequestException();
    }
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
