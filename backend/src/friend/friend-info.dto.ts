import { StatusType } from 'src/status/status.service';

export class FriendInfoDto {
  id: number;
  username: string;
  is_blocked: boolean;
  status: StatusType;
}
