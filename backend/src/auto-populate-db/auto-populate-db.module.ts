import { Module, forwardRef } from '@nestjs/common';
import { AutoPopulateDbService } from './auto-populate-db.service';
import { AuthModule } from 'src/auth/auth.module';
import { AvatarModule } from 'src/avatar/avatar.module';

@Module({
  providers: [AutoPopulateDbService],
  exports: [AutoPopulateDbService],
  imports: [forwardRef(() => AuthModule), AvatarModule],
})
export class AutoPopulateDbModule {}
