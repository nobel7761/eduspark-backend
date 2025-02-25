import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

@Schema()
class ClassCount {
  @Prop({
    type: [Types.ObjectId],
    ref: 'Class',
    required: true,
    message: 'Class ids are required',
  })
  @IsArray()
  @IsMongoId({ each: true })
  classIds: Types.ObjectId[];

  @Prop({ required: true, message: 'Count is required' })
  count: number;

  @Prop({ default: '' })
  @IsOptional()
  @IsString()
  comments?: string;
}

@Schema()
class ProxyClass {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
    message: 'Employee id is required',
  })
  @IsMongoId()
  employeeId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Class',
    required: true,
    message: 'Class id is required',
  })
  @IsMongoId()
  classId: Types.ObjectId;

  @Prop({ default: '' })
  @IsOptional()
  @IsString()
  comments?: string;
}

@Schema({ timestamps: true })
export class MonthlyClassCount {
  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
    message: 'Employee id is required',
  })
  @IsMongoId()
  employeeId: Types.ObjectId;

  @Prop({ required: true, message: 'Date is required' })
  @IsDateString()
  date: Date;

  @Prop({ type: [ClassCount], required: true, message: 'Classes are required' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassCount)
  classes: ClassCount[];

  @Prop({ default: false })
  @IsBoolean()
  hasProxyClass: boolean;

  @Prop({ type: [ProxyClass], default: [] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProxyClass)
  @IsOptional()
  proxyClasses?: ProxyClass[];
}

export const MonthlyClassCountSchema =
  SchemaFactory.createForClass(MonthlyClassCount);
