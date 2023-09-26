import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDTO } from './dto/login.dto';
import { NoAuth } from 'src/common/decorators/no-auth.decorator';
import { SetGroupDto } from './dto/set-group.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @NoAuth()
  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.userService.login(loginDTO);
  }

  @Get('info')
  getInfo(@Request() req: any) {
    return this.userService.getUserInfo(req.user);
  }

  @Post('setActiveGroup')
  setActiveGroup(@Body() setGroupDto: SetGroupDto, @Request() req: any) {
    return this.userService.setActiveGroup(req.user, setGroupDto);
  }
}
