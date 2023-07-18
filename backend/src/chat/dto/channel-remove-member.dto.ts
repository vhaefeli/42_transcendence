import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelRemoveMemberDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
