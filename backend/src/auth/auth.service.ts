import { HttpService } from '@nestjs/axios';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Profile42Api } from 'src/user/profile-42api.dto';
import { UsersService } from 'src/user/users.service';
import { ReturnSignInDto } from './return-sign-in.dto';
import { PrismaService } from 'src/prisma.service';
import { TfaService } from 'src/tfa/tfa.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private tfaService: TfaService,
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

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
      },
    });
    if (user?.password !== pass) throw new UnauthorizedException();

    const res: ReturnSignInDto = { tfa_enabled: user.tfa_enabled };
    if (res.tfa_enabled) {
      // TODO define tfaRequest model
      // TODO use tfaService to create a new tfaRequest
      // TODO return correct tfa_request_uuid
      res.tfa_request_uuid = 'blablabla';
    } else
      res.access_token = (
        await this.CreateToken(user.id, user.username)
      ).access_token;
    return res;
  }

  async login42Api(
    code: string,
    state: string,
  ): Promise<{ access_token: string }> {
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
        throw new InternalServerErrorException();
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
        throw new InternalServerErrorException();
      });
    return {
      access_token: await this.usersService.login42API(
        access_token42,
        profile42,
      ),
    };
  }
}
