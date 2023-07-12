import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCompletionDto {
  @IsNotEmpty()
  @IsNumber()
  readonly gameId: number;

  @IsNotEmpty()
  @IsNumber()
  readonly score: number;
}
