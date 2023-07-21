import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConnectToGameDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}
