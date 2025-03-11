import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { hashPassword } from '../utils/password.util';
import { User, UserDocument } from './user.model';
import { UserType } from '../enums/users.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: Partial<User>) {
    if (!user.password) {
      throw new Error('Password is required');
    }
    const hashedPassword = hashPassword(user.password);
    user.userType = UserType.DIRECTOR;

    return await this.userModel.create({
      ...user,
      password: hashedPassword,
    });
  }

  async findById(id: string, excludePassword = true) {
    if (id && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(id)
      .select(excludePassword ? { password: 0 } : {});

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, excludePassword = true) {
    const user = await this.userModel
      .findOne({ email })
      .select(excludePassword ? '-password' : '+password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmailForRegister(email: string) {
    const user = await this.userModel.findOne({ email }).exec();

    return user;
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
}
