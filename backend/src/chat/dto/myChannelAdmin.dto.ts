import { IsNotEmpty, IsNumber } from 'class-validator';

export class MyChannelAdminDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;
}
