import { ChannelTypes } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChannelChangeDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsEnum(ChannelTypes)
  @IsNotEmpty()
  readonly type: ChannelTypes;

  // Mandatory for PROTECTED otherwise empty
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsNumber()
  readonly ownerId: number;
}
