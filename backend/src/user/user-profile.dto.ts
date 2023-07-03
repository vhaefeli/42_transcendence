import { StatusType } from 'src/status/status.service';

export class UserProfileDto {
  id: number;
  username: string;
  avatar_url: string;
  is_friend: boolean;
  status?: StatusType;
}
