import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BlockService } from 'src/block/block.service';
import { PrismaService } from 'src/prisma.service';
import { StatusService } from 'src/status/status.service';
import { TokenInfoDto } from 'src/user/token-info.dto';
import { UsersService } from 'src/user/users.service';

import { FriendInfoDto } from './friend-info.dto';

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => BlockService))
    private blockService: BlockService,
    private statusService: StatusService,
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
    (await this.getFriends(from_id)).forEach((element) => {
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

  async isPendingInvitation(id1: number, id2: number): Promise<boolean> {
    let result = false;
    if (
      await this.prisma.friendshipInvitation.findFirst({
        where: {
          AND: [{ fromId: id1, toId: id2 }],
        },
      })
    ) {
      result = true;
    }
    if (
      await this.prisma.friendshipInvitation.findFirst({
        where: {
          AND: [{ fromId: id2, toId: id1 }],
        },
      })
    ) {
      result = true;
    }
    return result;
  }

  async findInvitationsSent(id: number) {
    const invitations = new Array<TokenInfoDto>();
    (
      await this.prisma.user.findUnique({
        where: { id: id },
        select: {
          invitations_sent: {
            select: {
              to: {
                select: { id: true, username: true },
              },
            },
          },
        },
      })
    ).invitations_sent.forEach((element) => {
      invitations.push({ ...element.to });
    });

    return invitations;
  }

  async findInvitationsReceived(id: number) {
    const invitations = new Array<TokenInfoDto>();
    (
      await this.prisma.user.findUnique({
        where: { id: id },
        select: {
          invitations_received: {
            select: {
              from: {
                select: { id: true, username: true },
              },
            },
          },
        },
      })
    ).invitations_received.forEach((element) => {
      invitations.push({ ...element.from });
    });

    return invitations;
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

  async refuseInvitation(from_username: string, id: number) {
    try {
      await this.prisma.friendshipInvitation.delete({
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
      });
    } catch (e) {
      if (e.code == 'P2025') throw new NotFoundException();
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

  async getFriends(id: number) {
    const friends = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        friends_added: {
          select: {
            id: true,
            username: true,
          },
        },
        friends: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    const blocked_users = await this.blockService.findBlocked(id);

    const res = new Array<Promise<FriendInfoDto>>();
    friends.friends.concat(friends.friends_added).forEach((friend) => {
      res.push(
        new Promise(async (resolve) =>
          resolve({
            ...friend,
            is_blocked:
              blocked_users.find((element) => friend.id === element.id)?.id !=
              null,
            status: await this.statusService.getStatus({ id: friend.id }),
          }),
        ),
      );
    });
    return await Promise.all(res);
  }

  async removeFriendship(my_id: number, friend_username: string) {
    try {
      if (
        !(await this.areFriends(
          my_id,
          await this.usersService.getId(friend_username),
        ))
      ) {
        throw new Error();
      }
      await this.prisma.user.update({
        where: { id: my_id },
        data: {
          friends: { disconnect: { username: friend_username } },
          friends_added: { disconnect: { username: friend_username } },
        },
      });
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async areFriends(id1: number, id2: number): Promise<boolean> {
    return (
      (await this.prisma.user.findFirst({
        where: {
          AND: [
            {
              id: id1,
            },
            {
              OR: [
                {
                  friends: {
                    some: {
                      id: id2,
                    },
                  },
                },
                {
                  friends_added: {
                    some: {
                      id: id2,
                    },
                  },
                },
              ],
            },
          ],
        },
      })) != null
    );
    //const otherFriendFound = await this.prisma.user.findFirst({
    //  where: { username: user },
    //  select: {
    //    friends: {
    //      where: { username: friend },
    //      select: {
    //        id: true,
    //        username: true,
    //      },
    //    },
    //    friends_added: {
    //      where: { username: friend },
    //      select: {
    //        id: true,
    //        username: true,
    //      },
    //    },
    //  },
    //});
  }
}
