import { StatusType } from 'src/status/status.service';

export class MyProfileDto {
  id: number;
  username: string;
  avatar_url: string;
  twoFA_enabled: boolean;
  status: StatusType;
}
