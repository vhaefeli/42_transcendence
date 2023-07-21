import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelRemoveBannedDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
