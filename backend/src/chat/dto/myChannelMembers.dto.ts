import { IsNotEmpty, IsNumber } from 'class-validator';

export class MyChannelMembersDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;
}
