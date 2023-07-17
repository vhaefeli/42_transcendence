import { ChannelTypes } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MIN_LENGTH,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class ChannelChangeDto {
  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsEnum(ChannelTypes)
  @IsNotEmpty()
  readonly type: ChannelTypes;

  @IsNotEmpty()
  @IsNumber()
  readonly ownerId: number;

  // Mandatory for PROTECTED otherwise empty
  @ValidateIf((o) => o.type === ChannelTypes.PROTECTED)
  @IsString()
  @MinLength(1)
  password?: string;
}
