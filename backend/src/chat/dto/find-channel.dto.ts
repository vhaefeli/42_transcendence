import { ChannelTypes } from '@prisma/client';

export class FindChannelDto {
  id: number;
  name: string;
  type: ChannelTypes;
  member: boolean;
  admin: boolean;
  owner: boolean;
}
