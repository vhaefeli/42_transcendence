import { game_status } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdatePlayerDto {
  @IsNotEmpty()
  readonly gameId: number;

  @IsNotEmpty()
  readonly playerId: number;

  @IsEnum(game_status)
  @IsNotEmpty()
  gameStatus: game_status;
}
