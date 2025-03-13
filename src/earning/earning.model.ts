import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { PaymentType } from '../enums/earning.enum';

@Schema({ timestamps: true })
export class Earning {
  @Prop({ required: true, type: Number, message: 'Amount must be a number' })
  @IsNumber()
  @Min(0)
  amount: number;

  @Prop({ type: Date, required: true })
  @IsDateString()
  date: Date;

  @Prop({ required: false, type: String, message: 'Comments must be a string' })
  @IsOptional()
  @IsString()
  comments?: string;

  @Prop({ required: true, type: String, message: 'Class must be a string' })
  @IsString()
  class: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Student',
    message: 'Student ID must be a valid MongoDB ObjectId',
  })
  @IsMongoId()
  studentId: Types.ObjectId;

  @Prop({
    type: [String],
    enum: PaymentType,
    required: true,
    message: 'Payment type must be a valid enum value',
  })
  @IsArray()
  @IsEnum(PaymentType, { each: true })
  paymentType: PaymentType[];

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  month?: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Employee',
    message: 'Received by must be a valid MongoDB ObjectId',
  })
  @IsMongoId()
  receivedBy: Types.ObjectId;
}

export const EarningSchema = SchemaFactory.createForClass(Earning);
