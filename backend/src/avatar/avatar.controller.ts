import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/auth.guard';
import { AvatarValidator } from './avatar.validator';

@Controller('user/avatar')
export class AvatarController {
  constructor(private avatarValidator: AvatarValidator) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    this.avatarValidator.validate(file);
  }

  @Public()
  @Get('info')
  async avatarRequirements() {
    return this.avatarValidator.get_requirements();
  }
}
