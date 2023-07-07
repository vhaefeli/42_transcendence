import { IsNotEmpty, IsBoolean } from 'class-validator';

export class CreatePlayerDto {
  @IsNotEmpty()
  readonly gameId: number;
  @IsNotEmpty()
  readonly seq: number;
  @IsNotEmpty()
  readonly playerId: number;

  @IsNotEmpty()
  readonly randomAssignation: boolean;
}
