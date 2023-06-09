import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

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

  async acceptInvitation(from_user: string, to_user: string): Promise<string> {
    try {
      const from = await this.prisma.user.findUnique({
        where: { username: from_user },
      });
      const to = await this.prisma.user.findUnique({
        where: { username: to_user },
      });
      const invitation = await this.prisma.friendshipInvitation.delete({
        where: {
          fromId_toId: {
            fromId: from.id,
            toId: to.id,
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
      if (!(await this.createFriendship(invitation.fromId, invitation.toId)))
        Logger.error('Invalid user ids');
      return invitation.from.username;
    } catch (e) {
      if (e.code == 'P2025')
        Logger.log(
          `InviteService::acceptInvitation: invitation does not exist`,
        );
      else Logger.error(e);
      return null;
    }
  }

  async createFriendship(id1: number, id2: number): Promise<boolean> {
    const from = await this.prisma.user.findUnique({ where: { id: id1 } });
    const to = await this.prisma.user.findUnique({ where: { id: id2 } });
    if (id1 == id2 || from == null || to == null) return false;
    await this.prisma.user.update({
      where: { id: from.id },
      data: {
        friends_added: {
          connect: { id: to.id },
        },
      },
    });
    return true;
  }
}
