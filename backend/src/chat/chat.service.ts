import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from 'src/prisma.service';
import { CreateChannelDto } from './create-channel.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async SaveDirectMessage(
    fromId: number,
    toId: number,
    message: string,
    date: Date,
  ) {
    if (message.length == 0) throw new WsException('Empty message');
    try {
      return await this.prisma.directMessage.create({
        data: {
          from: { connect: { id: fromId } },
          to: { connect: { id: toId } },
          message: message,
          date: date,
        },
        select: {
          id: true,
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

  async GetMyDirectMessages(id: number) {
    return await this.prisma.directMessage.findMany({
      where: {
        OR: [{ fromId: id }, { toId: id }],
      },
      select: {
        id: true,
        fromId: true,
        toId: true,
        message: true,
        date: true,
      },
    });
  }

  async CreateChannel(
    createChannelDto: CreateChannelDto,
    my_id: number,
  ): Promise<{ id: number }> {
    try {
      return await this.prisma.channel.create({
        data: {
          ...createChannelDto,
          ownerId: my_id,
          members: { connect: { id: my_id } },
          admins: { connect: { id: my_id } },
        },
        select: { id: true },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Channel name is already in use');
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }
}
