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
import { ExpenseType } from '../enums/expense.enum';

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  @IsNumber()
  @Min(0)
  amount: number;

  @Prop({ type: Date, required: true })
  @IsDateString()
  date: Date;

  @Prop({ required: false })
  @IsOptional()
  @IsString()
  comments?: string;

  @Prop({
    type: [String],
    enum: ExpenseType,
    required: true,
  })
  @IsArray()
  @IsEnum(ExpenseType, { each: true })
  purpose: ExpenseType[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  @IsMongoId()
  paidBy: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
