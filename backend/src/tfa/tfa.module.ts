import { Module, forwardRef } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { TfaController } from './tfa.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [TfaService],
  controllers: [TfaController],
  exports: [TfaService],
  imports: [forwardRef(() => AuthModule)],
})
export class TfaModule {}
