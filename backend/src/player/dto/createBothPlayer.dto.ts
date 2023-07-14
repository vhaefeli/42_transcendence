import { mode_type } from '@prisma/client';
import { IsNotEmpty, IsBoolean, IsEnum, IsNumber } from 'class-validator';

export class CreateBothPlayerDto {
  @IsNotEmpty()
  @IsNumber()
  readonly opponentId: number;

  @IsEnum(mode_type)
  @IsNotEmpty()
  readonly mode: mode_type;
}
