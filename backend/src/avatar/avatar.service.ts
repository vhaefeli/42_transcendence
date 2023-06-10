import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarService {
  async uploadAvatar(file: Express.Multer.File) {
    return true;
  }
}
