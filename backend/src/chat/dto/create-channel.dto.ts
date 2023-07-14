import { IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';
import { IsChannelType } from '../channel-type.validator';
import { ChannelTypes } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsChannelType()
  @Transform(({ value }) => value.toUpperCase())
  type: ChannelTypes;

  @ValidateIf((o) => o.type === ChannelTypes.PROTECTED)
  @IsString()
  @MinLength(1)
  password?: string;
}
