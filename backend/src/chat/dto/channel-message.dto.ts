import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReceivingChannelMessageDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsNumber()
  date: number;
}

export class SendingChannelMessageDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  senderId: number;

  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsNumber()
  date: number;
}
