import { ChannelTypes } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class ChannelJoinDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  // Mandatory for PROTECTED otherwise empty
  @ValidateIf((o) => o.type === ChannelTypes.PROTECTED)
  @IsString()
  @MinLength(1)
  password?: string;
}
