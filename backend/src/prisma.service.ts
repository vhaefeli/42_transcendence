import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ChannelTypes, PrismaClient } from '@prisma/client';
import { channel } from 'diagnostics_channel';

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
            level: 'BEGINNER',
            rank: 2,
            nbMatch: 1,
            nbGames: 3,
          },
          {
            username: 'TechGuru42',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
            level: 'INITIATION',
            rank: 1,
            nbMatch: 0,
            nbGames: 2,
          },
          {
            username: 'MusicLover88',
            password: 'f',
            avatar_url: 'http://localhost:3000/avatar/default.jpg',
            level: 'INITIATION',
            rank: 0,
            nbMatch: 0,
            nbGames: 1,
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
      await this.channel.createMany({
        data: [
          {
            name: 'VeryCoolChannel',
            ownerId: 1,
            type: ChannelTypes.PUBLIC,
          },
          {
            name: 'MyFriendsClub',
            ownerId: 6,
            type: ChannelTypes.PRIVATE,
          },
          {
            name: 'ProtectedChan',
            ownerId: 1,
            type: ChannelTypes.PROTECTED,
            password: 'very_secret',
          },
          {
            name: 'WeHateUserTest',
            ownerId: 5,
            type: ChannelTypes.PRIVATE,
          },
          {
            name: 'IWantIceCream',
            ownerId: 2,
            type: ChannelTypes.PUBLIC,
          },
          {
            name: 'timetoEAT!',
            ownerId: 3,
            type: ChannelTypes.PROTECTED,
            password: 'cat',
          },
        ],
      });
      await this.channel.update({
        where: { id: 1 },
        data: {
          admins: { connect: [{ id: 1 }] },
          members: {
            connect: [
              { id: 1 },
              { id: 2 },
              { id: 3 },
              { id: 4 },
              { id: 4 },
              { id: 6 },
              { id: 7 },
              { id: 8 },
              { id: 9 },
              { id: 10 },
              { id: 11 },
            ],
          },
        },
      });
      await this.channel.update({
        where: { id: 2 },
        data: {
          admins: {
            connect: [{ id: 1 }, { id: 6 }, { id: 10 }, { id: 8 }, { id: 11 }],
          },
          members: {
            connect: [{ id: 1 }, { id: 6 }, { id: 10 }, { id: 8 }, { id: 11 }],
          },
        },
      });
      await this.channel.update({
        where: { id: 3 },
        data: {
          admins: { connect: [{ id: 1 }] },
          members: { connect: [{ id: 1 }, { id: 6 }] },
        },
      });
      await this.channel.update({
        where: { id: 4 },
        data: {
          admins: { connect: [{ id: 5 }] },
          members: { connect: [{ id: 5 }, { id: 6 }] },
        },
      });
      await this.channel.update({
        where: { id: 5 },
        data: {
          admins: {
            connect: [
              { id: 2 },
              { id: 3 },
              { id: 4 },
              { id: 5 },
              { id: 6 },
              { id: 7 },
              { id: 8 },
              { id: 9 },
              { id: 10 },
              { id: 11 },
            ],
          },
          members: {
            connect: [
              { id: 1 },
              { id: 2 },
              { id: 3 },
              { id: 4 },
              { id: 5 },
              { id: 6 },
              { id: 7 },
              { id: 8 },
              { id: 9 },
              { id: 10 },
              { id: 11 },
            ],
          },
        },
      });
      await this.channel.update({
        where: { id: 6 },
        data: {
          admins: { connect: [{ id: 2 }] },
          members: { connect: [{ id: 2 }] },
        },
      });
      await this.game.createMany({
        data: [
          {
            initiatedById: 1,
            completed: true,
          },
          {
            initiatedById: 1,
            completed: true,
          },
          {
            initiatedById: 1,
            completed: true,
          },
        ],
      });
      await this.player.createMany({
        data: [
          {
            gameId: 1,
            seq: 1,
            playerId: 1,
            mode: 'BEGINNER',
            gameStatus: 'ENDED',
            score: 3,
            score4stat: true,
          },
          {
            gameId: 1,
            seq: 2,
            playerId: 3,
            mode: 'BEGINNER',
            gameStatus: 'ENDED',
            score: 0,
            score4stat: true,
          },
          {
            gameId: 2,
            seq: 1,
            playerId: 1,
            mode: 'BEGINNER',
            gameStatus: 'ENDED',
            score: 2,
            score4stat: true,
          },
          {
            gameId: 2,
            seq: 2,
            playerId: 2,
            mode: 'BEGINNER',
            gameStatus: 'ENDED',
            score: 1,
            score4stat: true,
          },
          {
            gameId: 3,
            seq: 1,
            playerId: 1,
            mode: 'BEGINNER',
            gameStatus: 'ENDED',
            score: 2,
            score4stat: true,
          },
          {
            gameId: 3,
            seq: 2,
            playerId: 2,
            mode: 'BEGINNER',
            gameStatus: 'ENDED',
            score: 1,
            score4stat: true,
          },
        ],
      });
    } catch {}
  }
}
