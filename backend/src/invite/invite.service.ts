import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InviteService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async createInvitation(from_user: string, to_user: string) {
    const from = await this.prisma.user.findUnique({
      where: { username: from_user },
    });
    const to = await this.prisma.user.findUnique({
      where: { username: to_user },
    });

    if (from == null || to == null || from.id == to.id) {
      Logger.error(`user ${from} or ${to} does not exist`);
      return;
    }
    try {
      await this.prisma.friendshipInvitation.create({
        data: {
          to: {
            connect: { username: to_user },
          },
          from: {
            connect: { username: from_user },
          },
        },
      });
    } catch (e) {
      if (e.code == 'P2002') Logger.log('FriendshipInvitation already exists');
      else {
        Logger.error(e.code);
        Logger.error(e.message);
      }
    }
  }

  async findInvitationsReceived(user: string) {
    const usr = await this.prisma.user.findUnique({
      where: { username: user },
      select: {
        id: true,
        invitations_received: {
          select: {
            fromId: true,
            from: {
              select: { username: true },
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
