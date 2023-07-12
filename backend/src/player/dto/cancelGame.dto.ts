import { IsNotEmpty, IsNumber } from 'class-validator';

export class CancelGameDto {
  @IsNotEmpty()
  @IsNumber()
  readonly gameId: number;
}
