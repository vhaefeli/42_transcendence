import { Module, forwardRef } from '@nestjs/common';
import { AutoPopulateDbService } from './auto-populate-db.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [AutoPopulateDbService],
  exports: [AutoPopulateDbService],
  imports: [forwardRef(() => AuthModule)],
})
export class AutoPopulateDbModule {}
