import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthUser, JwtAuthGuard } from 'src/guards';
import { JwtPayload } from 'src/auth/jwt-payload';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async loggedInUser(@AuthUser() user: JwtPayload) {
    return await this.usersService.findById(user.uid);
  }
}
