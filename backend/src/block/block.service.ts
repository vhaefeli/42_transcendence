import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FriendService } from 'src/friend/friend.service';
import { PrismaService } from 'src/prisma.service';

import { BlockedUserDto } from './blocked-user.dto';

@Injectable()
export class BlockService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => FriendService))
    private friendService: FriendService,
  ) {}

  async isBlocked(my_id: number, username: string) {
    return (
      (await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: my_id },
            { blocked_users: { some: { username: username } } },
          ],
        },
      })) != null
    );
  }

  async findBlocked(my_id: number): Promise<Array<BlockedUserDto>> {
    try {
      const blocked_users = new Array<Promise<BlockedUserDto>>();
      for (const user of (
        await this.prisma.user.findUniqueOrThrow({
          where: { id: my_id },
          select: { blocked_users: { select: { id: true, username: true } } },
        })
      ).blocked_users) {
        blocked_users.push(
          new Promise(async (resolve) =>
            resolve({
              ...user,
              is_friend: await this.friendService.areFriends(my_id, user.id),
            }),
          ),
        );
      }
      return await Promise.all(blocked_users);
    } catch (error) {
      Logger.error(error.code);
    }
  }

  async blockUser(my_id: number, username: string) {
    if (await this.isBlocked(my_id, username)) throw new NotFoundException();
    await this.prisma.user
      .update({
        where: { id: my_id },
        data: { blocked_users: { connect: { username: username } } },
      })
      .catch((error) => {
        if (error.code === 'P2025') throw new NotFoundException();
        Logger.error(error.code + error.msg);
        throw new InternalServerErrorException();
      });
  }

  async removeBlock(my_id: number, username: string) {
    if (!(await this.isBlocked(my_id, username))) throw new NotFoundException();
    await this.prisma.user
      .update({
        where: { id: my_id },
        data: {
          blocked_users: { disconnect: { username: username } },
        },
      })
      .catch((error) => {
        if (error.code === 'P2025') throw new NotFoundException();
        Logger.error(error.code + error.msg);
        throw new InternalServerErrorException();
      });
  }
}
