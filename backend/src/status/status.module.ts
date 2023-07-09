import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { StatusService } from './status.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [],
  providers: [StatusGateway, StatusService],
  exports: [StatusService],
  imports: [AuthModule],
})
export class StatusModule {}
