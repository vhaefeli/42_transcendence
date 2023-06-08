import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from 'src/user/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string): Promise<User> {
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

  async new(usr: CreateUserDto): Promise<any> {
    if (await this.isUsernameInUse(usr.username)) throw new ConflictException();

    return await this.prisma.user.create({
      data: {
        username: usr.username,
        password: usr.password,
      },
      select: {
        id: true,
        username: true,
      },
    });
  }

  async updateUsername(
    oldUsername: string,
    newUsername: string,
  ): Promise<boolean> {
    if (await this.isUsernameInUse(newUsername)) return false;
    await this.prisma.user.update({
      where: { username: oldUsername },
      data: {
        username: newUsername,
      },
    });
    return true;
  }

  async deleteUser(userName: string) {
    await this.prisma.user.delete({
      where: { username: userName },
    });
  }

  async getFriends(username: string) {
    const friends = await this.prisma.user.findUnique({
      where: { username: username },
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

  async getFriend(user: string, friend: string) {
    const friendFound = await this.prisma.user.findFirst({
      where: {
        AND: [
          {
            username: user,
          },
          {
            OR: [
              {
                friends: {
                  some: {
                    username: friend,
                  },
                },
              },
              {
                friends_added: {
                  some: {
                    username: friend,
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        friends: { select: { username: true } },
        friends_added: { select: { username: true } },
      },
    });
    const otherFriendFound = await this.prisma.user.findFirst({
      where: { username: user },
      select: {
        friends: {
          where: { username: friend },
          select: {
            id: true,
            username: true,
          },
        },
        friends_added: {
          where: { username: friend },
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    void friendFound;
    if (otherFriendFound.friends_added.length)
      return otherFriendFound.friends_added.at(0);
    return otherFriendFound.friends_added.at(0);
  }
}
