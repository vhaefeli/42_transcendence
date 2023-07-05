import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async SaveDirectMessage(
    fromId: number,
    toId: number,
    message: string,
    date: number,
  ) {
    try {
      await this.prisma.directMessage.create({
        data: {
          from: { connect: { id: fromId } },
          to: { connect: { id: toId } },
          message: message,
          date: date,
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        if (error?.meta.cause.search('dm_to_user') > 0)
          throw new WsException(`user with id ${toId} doesn't exist`);
        else if (error?.meta.cause.search > 0)
          throw new WsException(
            `Authenticated user with id ${fromId} wasn't found`,
          );
        throw error;
      }
      if (error?.code) Logger.error(error.code + ' ' + error.msg);
      else Logger.error(error);
      throw error;
    }
  }
}
