import { IsNotEmpty } from 'class-validator';
import { IsSafeCharacterString } from './safe-characters.validator';

export class UpdateUsernameDto {
  @IsSafeCharacterString()
  @IsNotEmpty()
  new_username: string;
}
