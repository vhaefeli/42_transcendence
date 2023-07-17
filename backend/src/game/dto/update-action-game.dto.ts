import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { PlayerAction } from '../game.entity';

export class UpdateActionGameDto {
  @IsNumber()
  @IsNotEmpty()
  gId: number;

  @IsEnum(PlayerAction)
  @IsNotEmpty()
  a: PlayerAction;
}
