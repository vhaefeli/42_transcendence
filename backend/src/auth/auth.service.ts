import { Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async CreateToken(id: number, username: string) {
    return {
      access_token: await this.jwtService.signAsync({
        sub: id,
        username: username,
      }),
    };
  }

  async SignIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) throw new UnauthorizedException();

    return this.CreateToken(user.id, user.username);
  }
}
