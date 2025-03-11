import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { Status } from '../enums/status.enum';
import { UserType } from '../enums/users.enum';
import { IUser } from '../types/user';
import { Trim } from '../decorators/trim.decorator';
import { Document, Types } from 'mongoose';
import { Role } from '../enums/common.enum';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Trim()
  @IsString({ message: 'First name is required' })
  @Matches(/^[a-zA-ZÀ-ÿ ]*$/, {
    message: 'First name contains invalid characters',
  })
  @Prop({
    type: String,
    required: true,
  })
  firstName: string;

  @Trim()
  @IsString({ message: 'Last name is required' })
  @Matches(/^[a-zA-ZÀ-ÿ ]*$/, {
    message: 'Last name contains invalid characters',
  })
  @Prop({
    type: String,
    required: true,
  })
  lastName: string;

  @IsString()
  @Prop({
    type: String,
  })
  forgotPasswordToken: string | null;

  @Trim()
  @Transform(({ value }: { value: string }) =>
    value ? value.toLowerCase() : '',
  )
  @IsEmail({}, { message: 'Invalid email' })
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @IsString({ message: 'Password is required' })
  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Trim()
  @IsString({ message: 'Phone number must be a number' })
  @MinLength(10, { message: 'Phone number must be at least 10 characters' })
  @IsPhoneNumber('BD', { message: 'Phone number must be a valid phone number' })
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  phone: string;

  @Trim()
  @IsOptional()
  @IsEnum(Status, { message: 'Status is required' })
  @Prop({
    type: String,
    enum: Status,
    required: false,
    default: Status.Active,
  })
  status: Status;

  @Trim()
  @IsEnum(UserType)
  @Prop({
    type: String,
    enum: UserType,
    required: true,
  })
  userType: UserType;

  @IsString()
  @Prop({
    type: String,
  })
  accessToken: string | null;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: String,
    enum: Role,
    default: Role.ADMIN,
  })
  role: Role;

  @Prop({
    type: Boolean,
    default: true,
  })
  isDirector: boolean;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ type: Date, default: null })
  refreshTokenExpiresAt: Date | null;

  @Prop({ type: String, default: null })
  passwordResetToken: string | null;

  @Prop({ type: Date, default: null })
  passwordResetExpires: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User &
  Document<Types.ObjectId> & {
    _id: Types.ObjectId;
  };
