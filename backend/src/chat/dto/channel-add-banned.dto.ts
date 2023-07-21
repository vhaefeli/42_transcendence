import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelAddBannedDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
