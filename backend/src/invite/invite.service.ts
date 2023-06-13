import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {
    prisma.$use(async (params, next) => {
      if (
        params.model == 'FriendshipInvitation' &&
        params.action == 'create' &&
        (await prisma.friendshipInvitation.findFirst({
          where: {
            from: { username: params.args['data']?.to.connect.username },
            toId: params.args['data']?.from.connect.id,
          },
        }))
      ) {
        throw new ConflictException();
      }
      return next(params);
    });
  }

  async createInvitation(from_id: number, to_user: string) {
    (await this.usersService.getFriends(from_id)).forEach((element) => {
      if (element.username == to_user) throw new ConflictException();
    });
    try {
      await this.prisma.friendshipInvitation.create({
        data: {
          to: {
            connect: { username: to_user },
          },
          from: {
            connect: { id: from_id },
          },
        },
      });
    } catch (e) {
      if (e.code == 'P2002') throw new ConflictException();
      if (e.code == 'P2025') throw new NotFoundException();
      if (e instanceof ConflictException) throw new ConflictException();
      Logger.error(e.code);
      Logger.error(e.message);
    }
  }

  async findInvitationsReceived(id: number) {
    const usr = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        invitations_received: {
          select: {
            from: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });
    if (usr === null) return null;

    return usr;
  }

  async acceptInvitation(from_username: string, id: number) {
    try {
      const invitation = await this.prisma.friendshipInvitation.delete({
        where: {
          fromId_toId: {
            fromId: (
              await this.prisma.user.findUniqueOrThrow({
                where: { username: from_username },
              })
            ).id,
            toId: id,
          },
        },
        select: {
          fromId: true,
          toId: true,
          from: {
            select: { username: true },
          },
        },
      });
      await this.createFriendship(invitation.fromId, invitation.toId);
    } catch (e) {
      if (e.code == 'P2025') throw new NotFoundException();
      if (e instanceof InternalServerErrorException) throw e;
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      else Logger.error(e);
    }
  }

  async createFriendship(id1: number, id2: number) {
    if (id1 == id2) throw new InternalServerErrorException();
    await this.prisma.user.update({
      where: { id: id1 },
      data: {
        friends_added: {
          connect: { id: id2 },
        },
      },
    });
  }
}
