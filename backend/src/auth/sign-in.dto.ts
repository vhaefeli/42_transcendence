import { IsNotEmpty } from 'class-validator';
import { IsSafeCharacterString } from 'src/user/safe-characters.validator';

export class SignInDto {
  @IsNotEmpty()
  @IsSafeCharacterString()
  username: string;

  @IsNotEmpty()
  password: string;
}
