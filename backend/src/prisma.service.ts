import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('exit', this.exitHandler.bind(this, app));
    process.on('beforeExit', this.exitHandler.bind(this, app));
    process.on('SIGINT', this.exitHandler.bind(this, app));
    process.on('SIGTERM', this.exitHandler.bind(this, app));
    process.on('SIGUSR2', this.exitHandler.bind(this, app));
  }

  async exitHandler(app: INestApplication) {
    await app.close();
  }
}
