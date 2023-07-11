import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelAddMemberDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
