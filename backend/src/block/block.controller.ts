import { Controller, Delete, Get, Param, Post, Request } from '@nestjs/common';
import { BlockService } from './block.service';

@Controller('user/block')
export class BlockController {
  constructor(private blockService: BlockService) {}

  @Get()
  async getUsersBlocked(@Request() req: any) {
    return await this.blockService.findBlocked(req.user.sub);
  }

  @Delete(':username')
  async removeBlock(@Param() params: any, @Request() req: any) {
    await this.blockService.removeBlock(req.user.sub, params.username);
  }

  @Post(':username')
  async blockUser(@Param() params: any, @Request() req: any) {
    await this.blockService.blockUser(req.user.sub, params.username);
  }
}
