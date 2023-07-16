import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelAddMutedDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
