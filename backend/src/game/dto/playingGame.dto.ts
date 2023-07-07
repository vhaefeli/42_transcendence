import { IsNotEmpty } from 'class-validator';

export class PlayingGameDto {
  @IsNotEmpty()
  readonly gameId: number;
}
