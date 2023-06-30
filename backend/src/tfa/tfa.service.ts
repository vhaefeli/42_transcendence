import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma.service';
import * as totp from 'totp-generator';

@Injectable()
export class TfaService {
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
      select: { time: true, email: true },
    });
    if (existing) {
      if (
        new Date().getTime() - existing.time.getTime() >= 60 * 60 * 1000 ||
        existing.email !== address
      )
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
}
