import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { AvatarService } from 'src/avatar/avatar.service';
import { FriendService } from 'src/friend/friend.service';
import { BlockService } from 'src/block/block.service';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from 'src/user/create-user.dto';
import { UpdateUsernameReturnDto } from 'src/user/update-username-return.dto';
import { UserProfileDto } from 'src/user/user-profile.dto';
import { MyProfileDto } from './my-profile.dto';
import { Profile42Api } from './profile-42api.dto';
import { TokenInfoDto } from './token-info.dto';
import { StatusService } from 'src/status/status.service';
import { AutoPopulateDbService } from 'src/auto-populate-db/auto-populate-db.service';
import { level_type } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private avatarService: AvatarService,
    @Inject(forwardRef(() => FriendService))
    private friendService: FriendService,
    @Inject(forwardRef(() => BlockService))
    private blockService: BlockService,
    @Inject(forwardRef(() => StatusService))
    private statusService: StatusService,
    configService: ConfigService,
    autoPopulateDb: AutoPopulateDbService,
  ) {
    if (configService.get<string>('BACKEND_AUTOPOPULATE_DB') === 'true')
      autoPopulateDb.AutoPopulateDb();
  }

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

    const hashed_pswd = this.authService.createHash(usr.password);
    const avatar = this.avatarService.generateAvatar();
    await Promise.all([hashed_pswd, avatar]);

    return await this.prisma.user.create({
      data: {
        username: usr.username,
        password: await hashed_pswd,
        avatar_url: await avatar,
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

  // modif
  async getProfile(
    profile: {
      id: number;
      username: string;
      avatar_url: string;
      level: level_type;
      rank: number;
      nbMatch: number;
      nbGames: number;
    },
    my_id: number,
  ): Promise<UserProfileDto> {
    const res: UserProfileDto = {
      ...profile,

      is_blocked:
        my_id === profile.id || my_id == null
          ? false
          : await this.blockService.isBlocked(my_id, profile.username),
      is_pendingInvitation: await this.friendService.isPendingInvitation(
        my_id,
        profile.id,
      ),

      is_friend:
        my_id === profile.id || my_id == null
          ? false
          : await this.friendService.areFriends(my_id, profile.id),
    };
    if (res.is_friend)
      res.status = await this.statusService.getStatus({ id: res.id });
    // res.is_blocked = false;
    // res.is_invited = true;
    return res;
  }

  async getProfileByUsername(
    username: string,
    my_id: number,
  ): Promise<UserProfileDto> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { username: username },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          level: true,
          rank: true,
          nbMatch: true,
          nbGames: true,
        },
      });
      return await this.getProfile(user, my_id);
    } catch (e) {
      if (e.code == 'P2025') throw new NotFoundException();
      Logger.error(e.code + ' ' + e.msg);
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      throw e;
    }
  }

  async getProfileById(id: number, my_id: number): Promise<UserProfileDto> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          level: true,
          rank: true,
          nbMatch: true,
          nbGames: true,
        },
      });
      return await this.getProfile(user, my_id);
    } catch (e) {
      if (e.code == 'P2025') throw new NotFoundException();
      if (e?.code) Logger.error(e.code + ' ' + e.msg);
      throw e;
    }
  }

  async getMe(my_id: number): Promise<MyProfileDto> {
    const status = this.statusService.getStatus({ id: my_id });
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: my_id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          tfa_enabled: true,
          level: true,
          rank: true,
          nbMatch: true,
          nbGames: true,
        },
      });
      return {
        ...user,
        status: await status,
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

  async generateUniqueUsername(wished_username: string): Promise<string> {
    if (await this.isUsernameInUse(wished_username)) {
      let n = 0;
      while (await this.isUsernameInUse(wished_username + n.toFixed())) n++;
      return wished_username + n.toFixed();
    }
    return wished_username;
  }

  async register42User(profile42: Profile42Api): Promise<TokenInfoDto> {
    const user = this.prisma.user.create({
      data: {
        username: await this.generateUniqueUsername(profile42.login),
        id42: profile42.id,
        access_token42: profile42.access_token,
        avatar_url: profile42.image_url,
      },
      select: { id: true, username: true },
    });
    return user;
  }

  async login42API(
    access_token: string,
    profile42: Profile42Api,
  ): Promise<string> {
    let user: TokenInfoDto;
    try {
      user = await this.prisma.user.findUniqueOrThrow({
        where: { id42: profile42.id },
        select: { id: true, username: true },
      });
    } catch (e) {
      if (e.code === 'P2025') user = await this.register42User(profile42);
      else {
        Logger.error(e);
        throw new InternalServerErrorException();
      }
    }
    return (await this.authService.CreateToken(user.id, user.username))
      .access_token;
  }
}
