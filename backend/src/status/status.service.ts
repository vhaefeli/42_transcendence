import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { status_type } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StatusService {
  private online_threshold: number;
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.online_threshold =
      +configService.get<number>('ONLINE_THRESHOLD_S') * 1000;
  }

  isOnline(last_online: Date): boolean {
    const time_elapsed = new Date(new Date().getTime() - last_online.getTime());
    return time_elapsed.getTime() <= this.online_threshold;
  }

  async getStatusByUsername(username: string): Promise<status_type> {
    return this.getStatusByTime(
      (
        await this.prisma.user.findFirstOrThrow({
          where: { username: username },
          select: { last_online: true },
        })
      ).last_online,
    );
  }

  async getStatusById(id: number): Promise<status_type> {
    return this.getStatusByTime(
      (
        await this.prisma.user.findFirstOrThrow({
          where: { id: id },
          select: { last_online: true },
        })
      ).last_online,
    );
  }

  getStatusByTime(time_elapsed: Date): status_type {
    const isOnline = this.isOnline(time_elapsed);
    if (isOnline) return status_type.ONLINE;
    return status_type.OFFLINE;
  }
}
