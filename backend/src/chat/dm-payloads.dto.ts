import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReceivingDmDto {
  @IsNotEmpty()
  @IsNumber()
  toId: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsNumber()
  date: number;
}

export class SendingDmDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  fromId: number;

  @IsNotEmpty()
  @IsNumber()
  toId: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsNumber()
  date: number;
}
