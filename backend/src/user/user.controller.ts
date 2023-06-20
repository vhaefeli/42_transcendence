import {
  Post,
  Get,
  Body,
  Controller,
  Delete,
  Param,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { UsersService } from 'src/user/users.service';
import { UpdateUsernameDto } from './update-username.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @Public()
  @Get('/all')
  async getUsers() {
    return await this.userService.findAll();
  }

  @Public()
  @Post('new')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.new(createUserDto);
  }

  @Post('update-username')
  async updateUsername(
    @Body() updateUsernameDto: UpdateUsernameDto,
    @Request() req: any,
  ) {
    return await this.userService.updateUsername(
      req.user.sub,
      updateUsernameDto.new_username,
    );
  }

  @Delete('delete')
  async deleteUser(@Request() req: any) {
    await this.userService.deleteUser(req.user.sub);
    return;
  }

  @Get('friends')
  async findFriends(@Request() req: any) {
    const friends = await this.userService.getFriends(req.user.sub);
    return JSON.stringify(friends, null, 4);
  }

  @Get('profile/:username')
  async findFriend(@Param() params: any, @Request() req: any) {
    const friend = await this.userService.getProfile(
      params.username,
      req.user.sub,
    );
    return friend;
    /*
    let friendDto: FriendInfoDto;
    if (friend == null) friendDto = { isFriend: false };
    else
      friendDto = {
        id: friend.id,
        username: friend.username,
        isFriend: true,
      };
    return JSON.stringify(friendDto, null, 4);
    */
  }

  @Get('me')
  async getMyProfile(@Request() req: any) {
    return await this.userService.getMe(req.user.sub);
  }
}
