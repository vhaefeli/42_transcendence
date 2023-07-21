import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChannelRemoveAdminDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
