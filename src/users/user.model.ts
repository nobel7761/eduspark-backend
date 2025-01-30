import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { Status } from 'src/enums/status.enum';
import { UserType } from 'src/enums/users.enum';
import { IUser } from 'src/types/user';
import { Trim } from 'src/decorators/trim.decorator';

export type UserDocument = HydratedDocument<User>;

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
  @Matches(/^\+?[0-9 ()-]+$/, {
    message: 'Phone number contains invalid characters',
  })
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  primaryPhoneNumber: string;

  @Trim()
  @IsOptional()
  @IsEnum(Status, { message: 'Status is required' })
  @Prop({
    type: String,
    enum: Status,
    required: false,
    default: Status.Inactive,
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
}

export const UserSchema = SchemaFactory.createForClass(User);
