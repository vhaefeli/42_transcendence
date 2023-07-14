import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { IS_PUBLIC_KEY } from './auth.guard';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuard implements CanActivate {
  secret: string;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private reflector: Reflector,
    configService: ConfigService,
  ) {
    this.secret = configService.get<string>('JWT_SECRET_KEY');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;

    const token = context.switchToWs().getClient().handshake.auth.token;
    if (!token) throw new WsException('No JWT provided');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.secret,
      });
      await this.prisma.user.findFirstOrThrow({
        where: {
          id: payload.sub,
          username: payload.username,
        },
      });
    } catch {
      throw new WsException('Invalid JWT provided');
    }
    return true;
  }
}
