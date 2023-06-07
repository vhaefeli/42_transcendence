import { Post, Get, Body, Controller, Delete, Param } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateUsernameDto } from './update-username.dto';
import { DeleteUserDto } from './delete-user.dto';
import { FriendInfoDto } from './friend-info.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @Get()
  async getUsers() {
    return `List of users:\n${JSON.stringify(
      await this.userService.findAll(),
      null,
      4,
    )}`;
  }

  @Post('new')
  async create(@Body() createUserDto: CreateUserDto) {
    if (await this.userService.new(createUserDto))
      return `User ${createUserDto.username} was created`;
    else return `User ${createUserDto.username} already exists`;
  }

  @Post('update-username')
  async updateUsername(@Body() updateUsernameDto: UpdateUsernameDto) {
    if (
      await this.userService.updateUsername(
        updateUsernameDto.oldUsername,
        updateUsernameDto.newUsername,
      )
    )
      return `Username changed succesfully`;
    else return `Username ${updateUsernameDto.newUsername} is already in use`;
  }

  @Delete('delete')
  async deleteUser(@Body() deleteUserDto: DeleteUserDto) {
    await this.userService.deleteUser(deleteUserDto.userName);
    return `User ${deleteUserDto.userName} was deleted`;
  }

  @Get(':user/friends/')
  async findAll(@Param() params: any) {
    const friends = await this.userService.getFriends(params.user);
    if (friends == null) return `No such user ${params.user}`;
    return JSON.stringify(friends, null, 4);
  }

  @Get(':user/view_friend/:friend')
  async findFriend(@Param() params: any) {
    const friend = await this.userService.getFriend(params.user, params.friend);
    let friendDto: FriendInfoDto;
    if (friend == null) friendDto = { isFriend: false };
    else
      friendDto = {
        id: friend.id,
        username: friend.username,
        isFriend: true,
      };
    return JSON.stringify(friendDto, null, 4);
  }
}
