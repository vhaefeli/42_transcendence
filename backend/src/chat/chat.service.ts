import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChannelTypes } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

import { ChannelAddMemberDto } from './channel-add-member.dto';
import { CreateChannelDto } from './create-channel.dto';
import { FindChannelDto } from './find-channel.dto';

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

  async FindAllChannels(my_id: number) {
    try {
      const channels = new Array<FindChannelDto>();
      (
        await this.prisma.channel.findMany({
          where: {
            OR: [
              { type: { not: ChannelTypes.PRIVATE } },
              { members: { some: { id: my_id } } },
            ],
          },
          select: {
            id: true,
            name: true,
            type: true,
            ownerId: true,
            admins: { select: { id: true } },
            members: { select: { id: true } },
          },
        })
      ).forEach((channel) => {
        channels.push({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          owner: channel.ownerId === my_id,
          admin:
            channel.admins.find((admin) => admin.id === my_id) !== undefined,
          member:
            channel.members.find((member) => member.id === my_id) !== undefined,
        });
      });
      return channels;
    } catch (error) {
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async ChannelAddMember(
    channelAddMemberDto: ChannelAddMemberDto,
    my_id: number,
  ) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelAddMemberDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
        },
      });

      // Channel is private and request user is not a member
      if (
        channel.type === ChannelTypes.PRIVATE &&
        channel.members.find((member) => member.id === my_id) === undefined
      )
        throw new NotFoundException("Channel wasn't found");

      // Request user is not the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to add a user",
        );

      // User to add is already in the channel
      if (
        channel.members.find(
          (admin) => admin.id === channelAddMemberDto.userId,
        ) !== undefined
      )
        throw new ConflictException('User is already in channel');
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      if (error?.code === 'P2025') {
        throw new NotFoundException("Channel wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }

    try {
      await this.prisma.channel.update({
        where: { id: channelAddMemberDto.channelId },
        data: { members: { connect: { id: channelAddMemberDto.userId } } },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("User wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async GetMyChannels(my_id: number) {
    try {
      return await this.prisma.channel.findMany({
        where: {
          members: { some: { id: my_id } },
        },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error) {
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async SaveChannelMessage(
    senderId: number,
    channelId: number,
    message: string,
    date: Date,
  ) {
    if (message.length == 0) throw new WsException('Empty message');
    try {
      return await this.prisma.channelMessage.create({
        data: {
          sender: { connect: { id: senderId } },
          channel: { connect: { id: channelId } },
          message: message,
          date: date,
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      if (error?.code === 'P2025')
        throw new WsException(`channel with id ${channelId} doesn't exist`);
      if (error?.code) Logger.error(error.code + ' ' + error.msg);
      else Logger.error(error);
      throw error;
    }
  }

  async IsUserInChannel(userId: number, channelId: number): Promise<boolean> {
    try {
      await this.prisma.channel.findFirstOrThrow({
        where: {
          AND: [{ id: channelId }, { members: { some: { id: userId } } }],
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async GetMyChannelMessages(id: number) {
    return await this.prisma.channelMessage.findMany({
      where: {
        channel: { members: { some: { id: id } } },
      },
      select: {
        id: true,
        senderId: true,
        channelId: true,
        message: true,
        date: true,
      },
    });
  }
}
