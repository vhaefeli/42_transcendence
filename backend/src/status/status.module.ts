import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';

@Module({
  controllers: [],
  providers: [StatusGateway]
})
export class StatusModule {}
