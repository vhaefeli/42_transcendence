import { IsNotEmpty } from 'class-validator';

export class CancelGameDto {
  @IsNotEmpty()
  readonly gameId: number;
}
