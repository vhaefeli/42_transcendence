import { StatusType } from 'src/status/status.service';

export class MyProfileDto {
  id: number;
  username: string;
  avatar_url: string;
  tfa_enabled: boolean;
  status: StatusType;
}
