import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginForm, RegistrationFormData } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() form: RegistrationFormData) {
    return await this.authService.createUser(form, true);
  }

  @Post('login')
  async login(@Body() form: LoginForm) {
    console.log('Calling login');
    return await this.authService.login(form);
  }
}
