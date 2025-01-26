import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationFormData } from './auth.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    _id: string;
    refreshToken: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() form: RegistrationFormData) {
    return await this.authService.createUser(form, true);
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // async login(@Request() req) {
  //   return this.authService.login(req.user);
  // }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: RequestWithUser) {
    return this.authService.refreshTokens(
      req.user._id.toString(),
      req.user.refreshToken,
    );
  }
}
