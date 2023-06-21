import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AvatarService } from 'src/avatar/avatar.service';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import { UpdateUsernameReturnDto } from 'src/user/update-username-return.dto';
import { UserProfileDto } from 'src/user/user-profile.dto';
import { MyProfileDto } from './my-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private avatarService: AvatarService,
  ) {}

  async findOne(username: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { username: username },
      select: { id: true, username: true, password: true },
    });
  }

  async isUsernameInUse(username: string) {
    return (
      (await this.prisma.user.findUnique({
        where: {
          username: username,
        },
      })) != null
    );
  }

  async findAll(): Promise<{ id: number; username: string }[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
  }

  async new(usr: CreateUserDto): Promise<{ id: number; username: string }> {
    if (await this.isUsernameInUse(usr.username)) throw new ConflictException();

    return await this.prisma.user.create({
      data: {
        username: usr.username,
        password: usr.password,
        avatar_url: await this.avatarService.generateAvatar(),
      },
      select: {
        id: true,
        username: true,
      },
    });
  }

  async updateUsername(
    id: number,
    new_username: string,
  ): Promise<UpdateUsernameReturnDto> {
    try {
      const updated: UpdateUsernameReturnDto = await this.prisma.user.update({
        where: { id: id },
        data: {
          username: new_username,
        },
        select: {
          id: true,
          username: true,
        },
      });
      updated.access_token = (
        await this.authService.CreateToken(updated.id, updated.username)
      ).access_token;
      return updated;
    } catch (e) {
      if ((e.code = 'P2002')) throw new ConflictException();
      Logger.error(e.code + ' ' + e.message);
    }
  }

  async deleteUser(id: number) {
    try {
      await this.prisma.user.delete({
        where: { id: id },
      });
    } catch (e) {
      if ((e.code = 'P2002')) throw new ConflictException();
      Logger.error(e.code + ' ' + e.message);
    }
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
    const res = new Array<{ id: number; username: string }>();
    friends.friends.forEach((element) => {
      res.push({ id: element.id, username: element.username });
    });
    friends.friends_added.forEach((element) => {
      res.push({ id: element.id, username: element.username });
    });
    return res;
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

  async getProfile(
    username: string,
    my_id: number = null,
  ): Promise<UserProfileDto> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { username: username },
        select: {
          id: true,
          username: true,
          avatar_url: true,
        },
      });
      return {
        ...user,
        is_friend:
          my_id === user.id || my_id == null
            ? false
            : await this.areFriends(my_id, user.id),
      };
    } catch (e) {
      if (e.code == 'P2025') throw new NotFoundException();
      Logger.error(e.code + ' ' + e.msg);
    }
  }

  async getMe(my_id: number): Promise<MyProfileDto> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: my_id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          twoFA_enabled: true,
          status: true,
        },
      });
      return {
        ...user,
      };
    } catch (e) {
      Logger.error(e.code + ' ' + e.msg);
      throw new NotFoundException();
    }
  }

  async getId(username: string) {
    return (
      await this.prisma.user.findUnique({
        where: { username: username },
        select: { id: true },
      })
    ).id;
  }

  async removeFriendship(my_id: number, friend_username: string) {
    try {
      if (!(await this.areFriends(my_id, await this.getId(friend_username)))) {
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
}
