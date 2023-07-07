import { mode_type } from '@prisma/client';
import { IsNotEmpty, IsBoolean, IsEnum } from 'class-validator';

export class CreateBothPlayerDto {
  @IsNotEmpty()
  readonly opponentId: number;

  @IsEnum(mode_type)
  @IsNotEmpty()
  readonly mode: mode_type;
}
