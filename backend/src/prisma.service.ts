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
    } catch {}
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
