import {
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/auth/auth.guard';
import { v4 } from 'uuid';
import { AvatarService } from './avatar.service';
import { AvatarValidator } from './avatar.validator';

@Controller('user/avatar')
export class AvatarController {
  constructor(
    private avatarValidator: AvatarValidator,
    private avatarService: AvatarService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const filename = v4().toString() + extname(file.originalname);
          const avatarValidator = new AvatarValidator();
          callback(avatarValidator.validate(file), filename);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.avatarService.uploadAvatar(req.user.sub, file.filename);
  }

  @Public()
  @Get('info')
  async avatarRequirements() {
    return this.avatarValidator.get_requirements();
  }
}
