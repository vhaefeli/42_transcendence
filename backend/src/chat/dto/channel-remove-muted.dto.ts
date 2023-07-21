import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelRemoveMutedDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
