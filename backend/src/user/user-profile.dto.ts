import { level_type } from '@prisma/client';
import { StatusType } from 'src/status/status.service';

export class UserProfileDto {
  id: number;
  username: string;
  avatar_url: string;
  is_blocked: boolean;
  is_pendingInvitation: boolean;
  is_friend: boolean;
  level: level_type;
  rank: number;
  nbMatch: number;
  nbGames: number;
  status?: StatusType;
}
