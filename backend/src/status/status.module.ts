import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { StatusService } from './status.service';

@Module({
  controllers: [],
  providers: [StatusGateway, StatusService],
  exports: [StatusService],
})
export class StatusModule {}
