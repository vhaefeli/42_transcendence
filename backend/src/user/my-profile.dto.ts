import { status_type } from '@prisma/client';

export class MyProfileDto {
  id: number;
  username: string;
  avatar_url: string;
  twoFA_enabled: boolean;
  status: status_type;
}
