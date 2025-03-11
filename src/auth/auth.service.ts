import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from './auth.dto';
import { RegisterDto } from './auth.dto';
import { ModuleRef } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';
import { UserDocument } from '../users/user.model';
import { comparePassword, hashPassword } from '../utils/password.util';

@Injectable()
export class AuthService {
  private usersService: UsersService;
  constructor(
    private jwtService: JwtService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.usersService = this.moduleRef.get(UsersService, {
      strict: false,
    });
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.usersService.findByEmailForRegister(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.create(registerDto);
    return this.generateTokens(user);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email, false);

    if (!user) {
      throw new UnauthorizedException('Invalid credentialssss');
    }

    if (!comparePassword(user.password, loginDto.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // TODO: Send email with reset token
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.password = resetPasswordDto.newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (
      !user ||
      !comparePassword(user.password, changePasswordDto.currentPassword)
    ) {
      throw new UnauthorizedException('Invalid current password');
    }

    user.password = hashPassword(changePasswordDto.newPassword);
    await user.save();
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(refreshToken);
      const user = await this.usersService.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.jwtService.signAsync(
        { sub: user._id, email: user.email },
        { expiresIn: '15m' },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserDocument) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user._id, email: user.email },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: user._id, email: user.email },
        { expiresIn: '7d' },
      ),
    ]);

    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    return { accessToken, refreshToken };
  }
}
