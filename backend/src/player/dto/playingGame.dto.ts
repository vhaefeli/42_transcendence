import { IsNotEmpty, IsNumber } from 'class-validator';

export class PlayingGameDto {
  @IsNotEmpty()
  @IsNumber()
  readonly gameId: number;
}
