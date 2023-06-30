import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma.service';
import * as totp from 'totp-generator';

@Injectable()
export class TfaService {
  // 2fa registration code expires after 60 seconds
  private readonly valid_time = 60 * 60 * 1000;

  transporter: any;
  template: string;

  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: configService.get<string>('EMAIL_2FA_USER'),
          pass: configService.get<string>('EMAIL_2FA_PASS'),
        },
      });
      this.template = readFileSync('2fa_code_email_template.html').toString();
    } catch (error) {
      Logger.error(error);
    }
  }

  private isTimeOk(creation_time: Date): boolean {
    if (new Date().getTime() - creation_time.getTime() >= this.valid_time)
      return false;
    return true;
  }

  async sendCode(
    address: string,
  ): Promise<{ success: boolean; code?: string }> {
    try {
      const code = totp(this.configService.get<string>('EMAIL_TOTP_SECRET'));
      const info = await this.transporter.sendMail({
        from: `"Transcendance team" <${this.configService.get<string>(
          'EMAIL_2FA_USER',
        )}>`,
        to: address,
        subject: 'Your ft_transcendance authentication code',
        // text: 'test2',
        html: this.template.replace('{{USER_AUTH_CODE}}', code),
      });
      if (info.rejected.length > 0) throw new Error('email failed to be sent');
      return { success: true, code: code };
    } catch (error) {
      if (error.code === 'EDNS') Logger.error("Couldn't find email provider");
      else if (error.code === 'EAUTH')
        Logger.error('Email provider authentication failed');
      else if (error.code === 'ESOCKET')
        Logger.error("Couldn't connect to email provider");
      else {
        Logger.error(error.code);
        Logger.error(error.message);
        Logger.error(error);
      }
      return { success: false };
    }
  }

  async register2FA(id: number, address: string) {
    const existing = await this.prisma.tfaRegistration.findFirst({
      where: { userId: id },
      select: {
        time: true,
        email: true,
      },
    });

    if (
      await this.prisma.user.findFirst({
        where: { AND: [{ id: id }, { tfa_enabled: true }] },
      })
    )
      throw new ConflictException();
    if (existing) {
      if (!this.isTimeOk(existing.time) || existing.email !== address)
        await this.prisma.tfaRegistration.delete({ where: { userId: id } });
      else
        throw new ConflictException(
          'Recent 2fa registration with the same address already exists',
        );
    }

    const code_mail = await this.sendCode(address);
    if (!code_mail.success) throw new ServiceUnavailableException();
    await this.prisma.tfaRegistration.create({
      data: {
        userId: id,
        email: address,
        code: code_mail.code,
      },
    });
  }

  async confirm2FA(id: number, code: string) {
    try {
      const registration = await this.prisma.tfaRegistration.findFirstOrThrow({
        where: { userId: id },
        select: {
          email: true,
          code: true,
          time: true,
        },
      });

      if (!this.isTimeOk(registration.time)) {
        await this.prisma.tfaRegistration.delete({ where: { userId: id } });
        throw new NotFoundException();
      }
      if (registration.code !== code)
        throw new UnauthorizedException('2fa code is invalid');

      const promises = new Array<Promise<any>>();
      promises.push(
        this.prisma.user.update({
          where: { id: id },
          data: {
            tfa_enabled: true,
            tfa_email_address: registration.email,
          },
        }),
      );
      promises.push(
        this.prisma.tfaRegistration.delete({
          where: { userId: id },
        }),
      );
      await Promise.all(promises);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      )
        throw error;
      if (error?.code === 'P2025') throw new NotFoundException();
      if (error?.code) Logger.error(error.code + ' ' + error.msg);
      else Logger.error(error);
      return;
    }
  }
}
