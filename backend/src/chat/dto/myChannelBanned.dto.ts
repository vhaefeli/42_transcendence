import { IsNotEmpty, IsNumber } from 'class-validator';

export class MyChannelBannedDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;
}
