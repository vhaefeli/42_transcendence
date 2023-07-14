import { HttpService } from '@nestjs/axios';
import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { TfaService } from 'src/tfa/tfa.service';
import { Profile42Api } from 'src/user/profile-42api.dto';
import { UsersService } from 'src/user/users.service';

import { ReturnSignInDto } from './return-sign-in.dto';

@Injectable()
export class AuthService {
  secret: string;
  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => TfaService)) private tfaService: TfaService,
    private http: HttpService,
    private prisma: PrismaService,
  ) {
    this.secret = configService.get<string>('JWT_SECRET_KEY');
  }

  async CreateToken(id: number, username: string) {
    return {
      access_token: await this.jwtService.signAsync({
        sub: id,
        username: username,
      }),
    };
  }

  async SignIn(username: string, pass: string): Promise<ReturnSignInDto> {
    const user = await this.prisma.user.findFirst({
      where: { username: username },
      select: {
        id: true,
        username: true,
        password: true,
        tfa_enabled: true,
        tfa_email_address: true,
      },
    });
    if (user?.password !== pass) throw new UnauthorizedException();

    const res: ReturnSignInDto = { tfa_enabled: user.tfa_enabled };
    if (res.tfa_enabled) {
      res.tfa_request_uuid = await this.tfaService.createTfaRequest(
        user.id,
        user.tfa_email_address,
      );
    } else
      res.access_token = (
        await this.CreateToken(user.id, user.username)
      ).access_token;
    return res;
  }

  async socketConnectionAuth(
    token: string,
  ): Promise<{ sub: number; username: string; iat: number; ext: number }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.secret,
      });

      await this.prisma.user.findFirstOrThrow({
        where: { id: payload.sub, username: payload.username },
      });
      return payload;
    } catch (error) {
      throw error;
    }
  }

  async login42Api(code: string, state: string): Promise<ReturnSignInDto> {
    let access_token42: string;
    let profile42: Profile42Api;

    await this.http
      .axiosRef({
        url: 'https://api.intra.42.fr/oauth/token',
        method: 'POST',
        params: {
          grant_type: 'authorization_code',
          client_id: this.configService.get<string>('API42_CLIENT_ID'),
          client_secret: this.configService.get<string>('API42_SECRET'),
          redirect_uri: this.configService.get<string>('API42_REDIRECT_URI'),
          code: code,
          state: state,
        },
      })
      .then((response) => {
        access_token42 = response.data.access_token;
      })
      .catch((error) => {
        if (error.response.status == 401) throw new UnauthorizedException();
        Logger.error(error);
        throw error;
      });

    await this.http
      .axiosRef({
        url: 'https://api.intra.42.fr/v2/me',
        method: 'GET',
        headers: { Authorization: `Bearer ${access_token42}` },
      })
      .then((response) => {
        profile42 = {
          id: response.data.id,
          login: response.data.login,
          image_url: response.data.image.link,
          access_token: access_token42,
        };
      })
      .catch((error) => {
        if (error.response.status == 401) throw new UnauthorizedException();
        Logger.error(error);
        throw error;
      });
    const access_token = await this.usersService.login42API(
      access_token42,
      profile42,
    );
    const user = await this.prisma.user.findUnique({
      where: { id42: profile42.id },
      select: {
        id: true,
        tfa_enabled: true,
        tfa_email_address: true,
      },
    });
    if (!user.tfa_enabled) {
      return { tfa_enabled: user.tfa_enabled, access_token: access_token };
    }
    return {
      tfa_enabled: user.tfa_enabled,
      tfa_request_uuid: await this.tfaService.createTfaRequest(
        user.id,
        user.tfa_email_address,
      ),
    };
  }
}
