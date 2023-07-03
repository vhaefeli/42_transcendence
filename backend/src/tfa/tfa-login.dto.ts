import { IsNotEmpty, IsString } from 'class-validator';
export class TfaLoginDto {
  @IsNotEmpty()
  @IsString()
  tfa_request_uuid: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
