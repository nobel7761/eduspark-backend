import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { Gender, Religion } from '../enums/common.enum';

export type StudentDocument = HydratedDocument<Student>;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, message: 'Name is required' })
  @IsString()
  name: string;

  @Prop({ required: true, message: 'Date of birth is required' })
  @IsDateString()
  dateOfBirth: Date;

  @Prop({ required: true, enum: Gender, message: 'Gender is required' })
  @IsEnum(Gender)
  gender: Gender;

  @Prop({ required: true, enum: Religion, message: 'Religion is required' })
  @IsEnum(Religion)
  religion: Religion;

  @IsOptional()
  @IsString()
  primaryPhone?: string;

  @IsOptional()
  @IsString()
  @Prop()
  secondaryPhone?: string;

  @Prop({ required: true, message: 'Institute name is required' })
  @IsString()
  instituteName: string;

  @Prop({ required: true, message: 'Class is required' })
  @IsString()
  class: string;

  @Prop()
  @IsOptional()
  @IsString()
  group?: string;

  @Prop({ type: [{ value: String, label: String }] })
  @IsOptional()
  @IsArray()
  @ValidateNested()
  subjects?: Array<{ value: string; label: string }>;

  @Prop({ required: true, message: 'Present address is required' })
  @IsString()
  presentAddress: string;

  @Prop()
  @IsString()
  @IsOptional()
  permanentAddress?: string;

  @Prop({
    type: {
      name: {
        type: String,
        required: true,
        message: 'Father name is required',
      },
      phone: {
        type: String,
        required: true,
        message: 'Father phone is required',
      },
      occupation: { type: String },
    },
    required: true,
    message: 'Father Information is required',
  })
  @IsObject()
  father: {
    name: string;
    phone: string;
    occupation?: string;
  };

  @Prop({
    type: {
      name: {
        type: String,
        required: true,
        message: 'Mother name is required',
      },
      phone: {
        type: String,
        required: true,
        message: 'Mother phone is required',
      },
      occupation: { type: String },
    },
    required: true,
    message: 'Mother Information is required',
  })
  @IsObject()
  mother: {
    name: string;
    phone: string;
    occupation?: string;
  };

  @Prop({
    type: {
      name: { type: String },
      phone: { type: String },
    },
  })
  @IsObject()
  @IsOptional()
  referredBy: {
    name: string;
    phone: string;
  };

  @Prop({
    type: {
      admissionFee: {
        type: Number,
        required: true,
        message: 'Admission fee is required',
      },
      formFee: {
        type: Number,
        required: true,
        message: 'Form fee is required',
      },
      monthlyFee: {
        type: Number,
        required: true,
        message: 'Monthly fee is required',
      },
      packageFee: {
        type: Number,
        required: true,
        message: 'Package fee is required',
      },
      referrerFee: { type: Number },
      comments: { type: String },
    },
    required: true,
    message: 'Payment Information is required',
  })
  @IsObject()
  payment: {
    admissionFee: number;
    formFee: number;
    monthlyFee: number;
    packageFee: number;
    referrerFee?: number;
    comments?: string;
  };

  @Prop({ type: String, required: true, message: 'Student ID is required' })
  @IsString()
  studentId: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
