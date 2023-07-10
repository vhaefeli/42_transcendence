import { IsNotEmpty } from 'class-validator';

export class UpdateCompletionDto {
  @IsNotEmpty()
  readonly gameId: number;

  @IsNotEmpty()
  readonly score: number;
}
