import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AvatarValidator {
  constructor() {
    this.maxSize = 1 * AvatarValidator.MB;
    this.accepted_file_types = ['image/jpg', 'image/png', 'image/jpeg'];
  }

  private static readonly MB = 1_000_000;

  private maxSize: number;
  private accepted_file_types: string[];

  validate(file: Express.Multer.File) {
    if (file.size > this.maxSize)
      return new BadRequestException(
        `File size is higher than ${this.maxSize} bytes`,
      );
    if (!this.accepted_file_types.includes(file.mimetype)) {
      return new BadRequestException(
        'File must be of type ' + this.accepted_file_types.toString(),
      );
    }
    return null;
  }

  get_requirements() {
    return {
      max_size: this.maxSize,
      file_types: this.accepted_file_types,
    };
  }
}
