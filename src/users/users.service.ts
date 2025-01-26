import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPassword } from 'src/utils/password.util';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: Partial<User>) {
    if (!user.password) {
      throw new Error('Password is required');
    }
    const hashedPassword = hashPassword(user.password);

    return await this.userModel.create({
      ...user,
      password: hashedPassword,
    });
  }

  async findByEmail(email: string, excludePassword = true) {
    return await this.userModel
      .findOne({ email })
      .select(excludePassword ? '-password' : '+password');
  }

  async updateUserWithAccessToken(id: string, accessToken: string | null) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userModel
      .findByIdAndUpdate(
        id,
        {
          accessToken,
        },
        { new: true },
      )
      .select({ password: 0 });
  }

  async addRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }

    user.refreshTokens.push(refreshToken);
    return await user.save();
  }

  async removeRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    return await user.save();
  }
}
