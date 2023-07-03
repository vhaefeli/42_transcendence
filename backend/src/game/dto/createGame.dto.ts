import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty()
  @IsNumber()
  readonly initiatedById: number;
}
