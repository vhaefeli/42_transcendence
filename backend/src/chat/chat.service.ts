import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChannelTypes, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

import { ChannelAddMemberDto } from './dto/channel-add-member.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { FindChannelDto } from './dto/find-channel.dto';
import { ChannelAddAdminDto } from './dto/channel-add-admin.dto';
import { ChannelRemoveAdminDto } from './dto/channel-remove-admin.dto';
import { ChannelChangeDto } from './dto/channel-change.dto';
import { ChatGateway } from './chat.gateway';
import { MyChannelMembersDto } from './dto/myChannelMembers.dto';
import { ChannelAddMutedDto } from './dto/channel-add-muted.dto';
import { ChannelRemoveMutedDto } from './dto/channel-remove-muted.dto';
import { ChannelAddBannedDto } from './dto/channel-add-banned.dto';
import { ChannelRemoveBannedDto } from './dto/channel-remove-banned.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

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
      // store the hash
      if (createChannelDto.password !== null) {
        const createdHash = await this.authService.createHash(
          createChannelDto.password,
        );
        createChannelDto.password = createdHash;
      }
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

  async FindAllChannelsList(my_id: number) {
    const channel = await this.prisma.channel.findMany({
      where: { type: { not: 'PRIVATE' } },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
    return channel;
  }

  async FindMyChannels(my_id: number) {
    const MyChannels = await this.prisma.$queryRaw`
          SELECT
          cm."A" AS "channelId",
          cm."B" AS "userId",
          c."name",
          c."type",
          CASE
              WHEN ca."B" IS NOT NULL THEN 'Admin'
              ELSE NULL
          END AS "Admin"
        FROM
          "_channel_members" cm
        JOIN
          "Channel" c ON cm."A" = c."id"
        LEFT JOIN
          "_channel_admins" ca ON cm."A" = ca."A" AND ca."B" = cm."B"
        WHERE
          cm."B" = ${my_id};
        `;
    return MyChannels;
  }

  async FindMyChannelMembers(
    my_id: number,
    myChannelMembersDto: MyChannelMembersDto,
  ) {
    Logger.log('my_id ' + my_id);
    Logger.log('channel ' + myChannelMembersDto.channelId);

    const channelMembers = await this.prisma.channel.findMany({
      where: { id: myChannelMembersDto.channelId },
      select: { members: { select: { username: true } } },
    });

    return channelMembers;
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
      await this.chatGateway.JoinUserToChannel(
        channelAddMemberDto.channelId,
        channelAddMemberDto.userId,
      );
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

  async ChannelAddAdmin(channelAddAdminDto: ChannelAddAdminDto, my_id: number) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelAddAdminDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request user is the owner
      if (channel.ownerId !== my_id)
        throw new UnauthorizedException(
          "You don't have the necessary privileges to add an admin",
        );

      // User to add is already in the channel as admin
      if (
        channel.admins.find(
          (admin) => admin.id === channelAddAdminDto.userId,
        ) !== undefined
      )
        throw new ConflictException('Admin is already in channel');
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
      throw error;
    }

    try {
      await this.prisma.channel.update({
        where: { id: channelAddAdminDto.channelId },
        data: { admins: { connect: { id: channelAddAdminDto.userId } } },
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

  async ChannelRemoveAdmin(
    channelRemoveAdminDto: ChannelRemoveAdminDto,
    my_id: number,
  ) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelRemoveAdminDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
        },
      });
      // Request user is the owner
      if (channel.ownerId !== my_id)
        throw new UnauthorizedException(
          "You don't have the necessary privileges to remove an Admin",
        );

      // Owner can't request to delete himself
      if (my_id === channelRemoveAdminDto.userId)
        throw new UnauthorizedException("You can't remove yourself as Admin");

      // Ensure User to remove is in the channel as admin
      if (
        channel.admins.find(
          (admin) => admin.id === channelRemoveAdminDto.userId,
        ) === undefined
      )
        throw new ConflictException('Admin is not in channel');
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
        where: { id: channelRemoveAdminDto.channelId },
        data: {
          admins: { disconnect: { id: channelRemoveAdminDto.userId } },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Admin wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async ChannelAddMuted(channelAddMutedDto: ChannelAddMutedDto, my_id: number) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelAddMutedDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          muted: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request to mute must concern a member
      if (
        !channel.members.find(
          (member) => member.id === channelAddMutedDto.userId,
        )
      ) {
        throw new NotFoundException('User must be a member');
      }

      // Request user is the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to muted",
        );
      // The owner can't be muted
      if (channel.ownerId === channelAddMutedDto.userId)
        throw new UnauthorizedException("The owner can't be muted");
      // User to add is already muted
      if (
        channel.muted.find(
          (muted) => muted.id === channelAddMutedDto.userId,
        ) !== undefined
      )
        throw new ConflictException('User is already muted for the channel');
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
      throw error;
    }

    try {
      await this.prisma.channel.update({
        where: { id: channelAddMutedDto.channelId },
        data: { muted: { connect: { id: channelAddMutedDto.userId } } },
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

  async ChannelRemoveMuted(
    channelRemoveMutedDto: ChannelRemoveMutedDto,
    my_id: number,
  ) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelRemoveMutedDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          muted: { select: { id: true } },
        },
      });
      // Request user is the owner or an Admin
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to remove a Muted",
        );

      // Ensure User to remove is in the channel as muted
      if (
        channel.muted.find(
          (muted) => muted.id === channelRemoveMutedDto.userId,
        ) === undefined
      )
        throw new NotFoundException(
          'User to be unmuted is not in the channel as muted user',
        );
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
        where: { id: channelRemoveMutedDto.channelId },
        data: {
          muted: { disconnect: { id: channelRemoveMutedDto.userId } },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Muted wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async ChannelAddBanned(
    channelAddBannedDto: ChannelAddBannedDto,
    my_id: number,
  ) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelAddBannedDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          banned: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request to mute must concern a member
      if (
        !channel.members.find(
          (member) => member.id === channelAddBannedDto.userId,
        )
      ) {
        throw new NotFoundException('User must be a member');
      }

      // Request user is the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to ban",
        );
      // The owner can't be banned
      if (channel.ownerId === channelAddBannedDto.userId)
        throw new UnauthorizedException("The owner can't be banneded");
      // User to add is already banneded
      if (
        channel.banned.find(
          (banned) => banned.id === channelAddBannedDto.userId,
        ) !== undefined
      )
        throw new ConflictException('User is already banned for the channel');
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
      throw error;
    }

    try {
      await this.prisma.channel.update({
        where: { id: channelAddBannedDto.channelId },
        data: { banned: { connect: { id: channelAddBannedDto.userId } } },
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

  async ChannelRemoveBanned(
    channelRemoveBannedDto: ChannelRemoveBannedDto,
    my_id: number,
  ) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelRemoveBannedDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          banned: { select: { id: true } },
        },
      });
      // Request user is the owner or an Admin
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to remove a Banned status",
        );

      // Ensure User to remove is in the channel as banned
      if (
        channel.banned.find(
          (banned) => banned.id === channelRemoveBannedDto.userId,
        ) === undefined
      )
        throw new NotFoundException(
          'User to be unbanned is not in the channel as banned user',
        );
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
        where: { id: channelRemoveBannedDto.channelId },
        data: {
          banned: { disconnect: { id: channelRemoveBannedDto.userId } },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Banned wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async channelchange(channelChangeDto: ChannelChangeDto, my_id: number) {
    try {
      // retrieve the channel info
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelChangeDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
        },
      });
      // user must be the admin
      if (channel.ownerId !== my_id) {
        throw new UnauthorizedException(
          "You don't have the necessary privileges to manage the channel",
        );
      }
      // Check password and type relationship
      if (channelChangeDto.password === undefined) {
        channelChangeDto.password = null;
      }

      if (
        channelChangeDto.type === 'PROTECTED' &&
        channelChangeDto.password === null
      ) {
        throw new ConflictException('Password mandatory as mode protected');
      } else if (
        channelChangeDto.type !== 'PROTECTED' &&
        channelChangeDto.password !== null
      ) {
        throw new ConflictException(
          'Password must be empty as mode not protected',
        );
      }
      // store the hash
      if (channelChangeDto.password !== null) {
        const createdHash = await this.authService.createHash(
          channelChangeDto.password,
        );
        channelChangeDto.password = createdHash;
      }
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
        where: { id: channelChangeDto.channelId },
        data: {
          id: channelChangeDto.channelId,
          type: channelChangeDto.type,
          ownerId: channelChangeDto.ownerId,
          password: channelChangeDto.password,
          admins: { connect: { id: channelChangeDto.ownerId } },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Banned wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }
}
