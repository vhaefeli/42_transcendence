import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelAddAdminDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
