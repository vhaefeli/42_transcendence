import { IsNotEmpty, IsNumber } from 'class-validator';

export class MyChannelMutedDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;
}
