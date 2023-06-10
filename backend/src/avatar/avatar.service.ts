import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AvatarService {
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {}
  async uploadAvatar(user_id: number, file: Express.Multer.File) {
    const avatar_url = await this.prisma.user.update({
      where: { id: user_id },
      data: {
        avatar_url: join(
          this.configService.get<string>('SERVER_HOSTNAME'),
          'avatar',
          file.filename,
        ),
      },
      select: { avatar_url: true },
    });
    return avatar_url;
  }
}
