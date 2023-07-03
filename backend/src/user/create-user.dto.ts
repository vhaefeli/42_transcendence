import { IsNotEmpty, MinLength } from 'class-validator';
import { IsSafeCharacterString } from './safe-characters.validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsSafeCharacterString()
  username: string;

  @MinLength(1)
  password: string;
}
