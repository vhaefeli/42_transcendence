import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async autoPopulateDB() {
    // FOR DEBUG PURPOSES
    Logger.log('Creating test users');
    try {
      await this.user.createMany({
        data: [
          {
            username: 'userTest',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'TechGuru42',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'MusicLover88',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'TravelBug123',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'FitnessFanatic22',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'FoodieExplorer',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'GamingNinja99',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'Bookworm2000',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'FashionistaQueen',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'SportsFan4Life',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
          {
            username: 'MovieBuff777',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
          },
        ],
      });
      await this.user.update({
        where: { username: 'userTest' },
        data: {
          friends: {
            connect: [
              { username: 'MovieBuff777' },
              { username: 'Bookworm2000' },
            ],
          },
          friends_added: {
            connect: [
              { username: 'SportsFan4Life' },
              { username: 'FoodieExplorer' },
            ],
          },
          blocked_users: {
            connect: [
              { username: 'FoodieExplorer' },
              { username: 'TravelBug123' },
            ],
          },
          blocked_by: {
            connect: [
              { username: 'FoodieExplorer' },
              { username: 'FitnessFanatic22' },
            ],
          },
        },
      });
      await this.friendshipInvitation.create({
        data: {
          to: { connect: { username: 'userTest' } },
          from: { connect: { username: 'GamingNinja99' } },
        },
      });
      await this.friendshipInvitation.create({
        data: {
          to: { connect: { username: 'TechGuru42' } },
          from: { connect: { username: 'userTest' } },
        },
      });
      await this.directMessage.createMany({
        data: [
          {
            fromId: 1,
            toId: 2,
            message: 'Hello user',
            date: new Date('Jul 03 2023 11:22:52'),
          },
          {
            fromId: 2,
            toId: 1,
            message: 'Heyyyyy',
            date: new Date('Jul 03 2023 14:00:03'),
          },
          {
            fromId: 2,
            toId: 1,
            message: 'how r u doing',
            date: new Date('Jul 03 2023 14:01:14'),
          },
          {
            fromId: 1,
            toId: 11,
            message: 'Hello, you are a friend',
            date: new Date('Dec 31 1970 00:00:00'),
          },
          {
            fromId: 11,
            toId: 1,
            message: 'I am, indeed',
            date: new Date('Dec 25 1999 10:10:10'),
          },
          {
            fromId: 1,
            toId: 6,
            message: 'You are a blocked friend',
            date: new Date('Jul 03 2023 11:22:52'),
          },
          {
            fromId: 6,
            toId: 1,
            message: "And you shouldn' see this message",
            date: new Date('Jul 05 2023 11:22:52'),
          },
          {
            fromId: 1,
            toId: 5,
            message: "We aren' friends and you have blocked me",
            date: new Date('Jul 03 2022 11:22:52'),
          },
          {
            fromId: 5,
            toId: 1,
            message: "i don't like you",
            date: new Date('Jul 03 2023 11:22:52'),
          },
        ],
      });
    } catch {}
  }
}
