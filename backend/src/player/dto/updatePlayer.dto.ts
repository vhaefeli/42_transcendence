import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePlayerDto {
  @IsNotEmpty()
  @IsNumber()
  readonly gameId: number;
}
