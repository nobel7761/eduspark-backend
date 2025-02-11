import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { LoginForm, RegistrationFormData } from './auth.dto';
import { UserType } from '../enums/users.enum';
import { Status } from '../enums/status.enum';
import { JwtPayload } from './jwt-payload';
import { UserDocument } from '../users/user.model';
import { comparePassword } from '../utils/password.util';

@Injectable()
export class AuthService {
  private usersService: UsersService;
  private jwtService: JwtService;

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.usersService = this.moduleRef.get(UsersService, { strict: false });
    this.jwtService = this.moduleRef.get(JwtService, { strict: false });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && comparePassword(password, user.password)) {
      return user;
    }
    return null;
  }

  async createUser(form: RegistrationFormData, autoLogin: boolean = false) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

    if (form.password && !passwordRegex.test(form.password)) {
      throw new BadRequestException('Invalid password format');
    }

    try {
      const foundUser = await this.usersService.findByEmail(form.email);
      if (foundUser) {
        throw new BadRequestException('User already exists');
      }

      const user = await this.usersService.create({
        ...form,
        userType: UserType.Student,
        status: Status.Active,
      });

      try {
        if (autoLogin) {
          const jwtPayload: JwtPayload = {
            uid: user._id.toString(),
            userType: user.userType,
            status: user.status,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          };

          const accessToken = this.jwtService.sign(jwtPayload);
          await this.usersService.updateUserWithAccessToken(
            user._id.toString(),
            accessToken,
          );
          return {
            accessToken,
          };
        }
      } catch (error) {
        console.log(error);
        await user.deleteOne();
        throw new InternalServerErrorException();
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('User already exists');
    }

    return this.usersService.create(form);
  }

  async login(form: LoginForm) {
    const email = form.email.toLowerCase();
    const user = await this.usersService.findByEmail(email, false);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid =
      user && comparePassword(form.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, uid: user._id.toString() };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return {
      access_token: accessToken,
      user_type: user.userType,
    };
  }
}
