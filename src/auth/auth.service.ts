import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegistrationFormData } from './auth.dto';
import { UserType } from 'src/enums/users.enum';
import { Status } from 'src/enums/status.enum';
import { JwtPayload } from './jwt-payload';
import { UserDocument } from 'src/users/user.model';
import { comparePassword } from 'src/utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && comparePassword(user.password, password)) {
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

  // async login(user: UserDocument) {
  //   const payload = { email: user.email, sub: user._id.toString() };
  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_ACCESS_SECRET,
  //     expiresIn: '15m',
  //   });
  //   const refreshToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_REFRESH_SECRET,
  //     expiresIn: '7d',
  //   });

  //   await this.usersService.addRefreshToken(user._id.toString(), refreshToken);

  //   return {
  //     access_token: accessToken,
  //     refresh_token: refreshToken,
  //   };
  // }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findByEmail(userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, sub: user._id.toString() };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.usersService.removeRefreshToken(
      user._id.toString(),
      refreshToken,
    );
    await this.usersService.addRefreshToken(
      user._id.toString(),
      newRefreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
