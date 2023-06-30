import { IsNotEmpty, IsNumberString } from 'class-validator';

export class Confirm2FADto {
  @IsNotEmpty()
  @IsNumberString()
  code: string;
}
