import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/decorator/guard';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { UpdateDto } from './dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @Patch('me')
  updateMe(@GetUser() user: User, @Body() dto: UpdateDto) {
    return this.userService.updateMe(user, dto);
  }
}
