import {
  ConflictException,
  ConsoleLogger,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChannelTypes } from '@prisma/client';
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
import { ChannelJoinDto } from './dto/channel-join.dto';
import { MyChannelBannedDto } from './dto/myChannelBanned.dto';
import { MyChannelAdminDto } from './dto/myChannelAdmin.dto';
import { MyChannelMutedDto } from './dto/myChannelMuted.dto';
import { ChannelRemoveMemberDto } from './dto/channel-remove-member.dto';
import { log } from 'console';

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
    my_id: number,
    createChannelDto: CreateChannelDto,
  ): Promise<{ id: number }> {
    try {
      // store the hash
      if (createChannelDto.password != null) {
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
          END AS "Admin",
          c."ownerId"  
        FROM
          "_channel_members" cm
        JOIN
          "Channel" c ON cm."A" = c."id"
        LEFT JOIN
          "_channel_admins" ca ON cm."A" = ca."A" AND ca."B" = cm."B"
        WHERE
          cm."B" = ${my_id}
        ORDER BY c."name"
        `;
    return MyChannels;
  }

  // ------------------------------------------------------------------------
  async FindMyChannelMembers(my_id: number, channelId: number) {
    try {
      if (!channelId) throw new NotFoundException("Channel wasn't set");

      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelId },
        select: {
          id: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request user is not the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined &&
        channel.members.find((members) => members.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to see the member list",
        );
      const channelMembers = await this.prisma.channel.findFirst({
        where: { id: channelId },
        select: {
          // id: true,
          members: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
            },
          },
        },
      });
      return channelMembers;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Channel wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async FindMyChannelAdmin(my_id: number, channelId: number) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelId },
        select: {
          id: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request user is not the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined &&
        channel.members.find((members) => members.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to see the admin list",
        );
      const channelAdmin = await this.prisma.channel.findMany({
        where: { id: channelId },
        select: {
          admins: { select: { id: true, username: true, avatar_url: true } },
        },
      });

      return channelAdmin;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Channel wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async FindMyChannelMutted(my_id: number, channelId: number) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelId },
        select: {
          id: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request user is not the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined &&
        channel.members.find((members) => members.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to see the muted member list",
        );
      const channelMuted = await this.prisma.channel.findMany({
        where: { id: channelId },
        select: {
          muted: { select: { id: true, username: true, avatar_url: true } },
        },
      });

      return channelMuted;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Channel wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async FindMyChannelBanned(my_id: number, channelId: number) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelId },
        select: {
          id: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
        },
      });
      // Request user is not the owner or an admin of the channel
      if (
        channel.ownerId !== my_id &&
        channel.admins.find((admin) => admin.id === my_id) === undefined &&
        channel.members.find((members) => members.id === my_id) === undefined
      )
        throw new UnauthorizedException(
          "You don't have the necessary privileges to see the banned member list",
        );
      const channelBanned = await this.prisma.channel.findMany({
        where: { id: channelId },
        select: {
          banned: { select: { id: true, username: true, avatar_url: true } },
        },
      });

      return channelBanned;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Channel wasn't found");
      }
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
          banned: { select: { id: true } },
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
      // User is banned in the channel
      if (
        channel.banned.find(
          (banned) => banned.id === channelAddMemberDto.userId,
        ) !== undefined
      )
        throw new ConflictException('User is banned in channel');
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
      await this.chatGateway.JoinUserToChannel(
        channelAddMemberDto.channelId,
        channelAddMemberDto.userId,
      );
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

  async IsUserMutedInChannel(
    userId: number,
    channelId: number,
  ): Promise<boolean> {
    try {
      await this.prisma.channel.findFirstOrThrow({
        where: {
          AND: [{ id: channelId }, { muted: { some: { id: userId } } }],
        },
      });
      return true;
    } catch (error) {
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
        data: {
          admins: { connect: { id: channelAddAdminDto.userId } },
          members: { connect: { id: channelAddAdminDto.userId } },
        },
      });
      await this.chatGateway.JoinUserToChannel(
        channelAddAdminDto.channelId,
        channelAddAdminDto.userId,
      );
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
        throw new UnauthorizedException(
          "You can't remove yourself as Admin, role mandatory for the owner",
        );

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
          "You don't have the necessary privileges to mute",
        );
      // The owner can't be muted
      if (channel.ownerId === channelAddMutedDto.userId)
        throw new UnauthorizedException("The owner can't be muted");
      // The admins can't be muted
      if (
        channel.admins.find(
          (admin) => admin.id === channelAddMutedDto.userId,
        ) !== undefined
      )
        throw new UnauthorizedException("Admins can't be muted");
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
        throw new UnauthorizedException("The owner can't be ban");
      // The Admin can't be banned
      if (
        channel.admins.find(
          (admin) => admin.id === channelAddBannedDto.userId,
        ) !== undefined
      )
        throw new UnauthorizedException("Admins can't be ban");
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
        data: {
          banned: { connect: { id: channelAddBannedDto.userId } },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("User wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }

    // this should not show an error especialy because a new banned user can be set without
    // a member already set
    try {
      await this.prisma.channel.update({
        where: { id: channelAddBannedDto.channelId },
        data: {
          members: { disconnect: { id: channelAddBannedDto.userId } },
        },
      });
      // Kick user out of the gateway
      await this.chatGateway.KickUserFromChannel(
        channelAddBannedDto.channelId,
        my_id,
      );
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
    // when possible, remove the member
    try {
      await this.prisma.channel.update({
        where: { id: channelRemoveBannedDto.channelId },
        data: {
          members: { disconnect: { id: channelRemoveBannedDto.userId } },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        //   no error required as expected
        //   throw new NotFoundException("Member wasn't found");
      }
      if (error?.code) Logger.error(error.code + ' ' + error.message);
      else Logger.error(error);
      throw error;
    }
  }

  async ChannelRemoveMember(
    channelRemoveMemberDto: ChannelRemoveMemberDto,
    my_id: number,
  ) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelRemoveMemberDto.channelId },
        select: {
          id: true,
          type: true,
          ownerId: true,
          admins: { select: { id: true } },
          members: { select: { id: true } },
          muted: { select: { id: true } },
        },
      });

      let suppressOK: boolean = false;

      const remainingMember = await this.prisma.channel.findFirst({
        where: { id: channelRemoveMemberDto.channelId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      // Request user is himself asking for suppression --> ok except if owner
      if (my_id === channelRemoveMemberDto.userId) suppressOK = true;

      // Request user is an admin --> ok when not himself
      if (
        channel.admins.find(
          (admin) =>
            admin.id === my_id &&
            channelRemoveMemberDto.userId !== channel.ownerId,
        )
      )
        suppressOK = true;

      // if the owner is the user, and there more than one member, not autorized
      if (
        my_id === channel.ownerId &&
        remainingMember._count.members > 1 &&
        channelRemoveMemberDto.userId !== channel.ownerId
      )
        suppressOK = false;

      // remove unautorized
      if (suppressOK === false)
        throw new UnauthorizedException(
          "You don't have the necessary privileges to remove that Member",
        );

      // Ensure User to remove is in the channel
      if (
        channel.members.find(
          (member) => member.id === channelRemoveMemberDto.userId,
        ) === undefined
      )
        throw new NotFoundException(
          'User to be remove from members is not in the channel',
        );

      // Extract number of members
      const memberWithCount = await this.prisma.channel.findFirst({
        where: { id: channelRemoveMemberDto.channelId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });
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
      //the banned is staying alive
      await this.prisma.channel.update({
        where: { id: channelRemoveMemberDto.channelId },
        data: {
          members: { disconnect: { id: channelRemoveMemberDto.userId } },
          muted: { disconnect: { id: channelRemoveMemberDto.userId } },
        },
      });
      // Kick user out of the gateway
      await this.chatGateway.KickUserFromChannel(
        channelRemoveMemberDto.channelId,
        channelRemoveMemberDto.userId,
      );
      // suppress the messages otherwise impossible to suppress the channel
      await this.prisma.channelMessage.deleteMany({
        where: { channelId: channelRemoveMemberDto.channelId },
      });
      // Extract number of members to be sure we are at 0
      const memberWithCount = await this.prisma.channel.findFirst({
        where: { id: channelRemoveMemberDto.channelId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });
      // suppress the channel when no more members
      if (memberWithCount._count.members === 0) {
        await this.chatGateway.KickAllFromChannel(
          channelRemoveMemberDto.channelId,
        );
        await this.prisma.channel.delete({
          where: { id: channelRemoveMemberDto.channelId },
        });
      }
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException("Member wasn't found");
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
          admins: {
            connect: { id: channelChangeDto.ownerId },
          },
          members: { connect: { id: channelChangeDto.ownerId } },
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

  async channelJoin(channelJoinDto: ChannelJoinDto, my_id: number) {
    try {
      const channel = await this.prisma.channel.findFirstOrThrow({
        where: { id: channelJoinDto.channelId },
        select: {
          id: true,
          type: true,
          password: true,
          members: { select: { id: true } },
          banned: { select: { id: true } },
        },
      });

      const memberStatus = channel.members.find(
        (member) => member.id === my_id,
      );
      // Exclude members already defined
      if (channel.members.find((member) => member.id === my_id)) {
        throw new NotFoundException('User is already a member');
      }

      // Exclude banned user
      if (channel.banned.find((Banned) => Banned.id === my_id))
        throw new ConflictException('You have been banned on that channel');
      // if channel is private, the membership is mandatory
      if (memberStatus === undefined && channel.type === 'PRIVATE')
        throw new NotFoundException('You are not a member');
      // if channel is public, the membership is create on the fly
      if (memberStatus === undefined && channel.type === 'PUBLIC') {
        await this.prisma.channel.update({
          where: { id: channelJoinDto.channelId },
          data: { members: { connect: { id: my_id } } },
        });
        // joinUserToChannel;
        await this.chatGateway.JoinUserToChannel(
          channelJoinDto.channelId,
          my_id,
        );
      }
      // if channel is protected, the membership is created if the password is ok
      if (channel.type === 'PROTECTED') {
        if (channelJoinDto.password === undefined)
          throw new NotFoundException('Missing Password');

        const passwordMatches = await this.authService.compareHash(
          channel.password,
          channelJoinDto.password,
        );

        if (passwordMatches) {
          if (memberStatus === undefined)
            await this.prisma.channel.update({
              where: { id: channelJoinDto.channelId },
              data: { members: { connect: { id: my_id } } },
            });
          // joinUserToChannel;
          await this.chatGateway.JoinUserToChannel(
            channelJoinDto.channelId,
            my_id,
          );
        } else {
          throw new NotFoundException('Bad Password');
        }
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
  }
}
