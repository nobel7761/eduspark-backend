import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsDateString,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HydratedDocument, Document, Types } from 'mongoose';
import { Director } from '../directors/director.model';

export type ManagementRegularTimingDocument =
  HydratedDocument<ManagementRegularTiming>;

@Schema()
class Timing {
  @Prop({ required: true })
  @IsDateString({}, { message: 'In time must be a valid date string' })
  @IsNotEmpty({ message: 'In time is required' })
  inTime: string;

  @Prop({ required: true })
  @IsDateString({}, { message: 'Out time must be a valid date string' })
  @IsNotEmpty({ message: 'Out time is required' })
  outTime: string;
}

const TimingSchema = SchemaFactory.createForClass(Timing);

@Schema({ timestamps: true })
export class ManagementRegularTiming extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Director', required: true })
  directorId: Director & Document;

  @Prop({ required: true })
  @IsDateString({}, { message: 'Date must be a valid date string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @Prop({ type: [TimingSchema], required: true })
  @IsArray({ message: 'Timings must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Timing)
  @IsNotEmpty({ message: 'Timings are required' })
  timings: { inTime: string; outTime: string }[];

  @Prop({ required: true })
  @IsNumber({}, { message: 'Total hours must be a number' })
  @IsNotEmpty({ message: 'Total hours is required' })
  totalHours: number;

  @Prop()
  @IsOptional()
  @IsString({ message: 'Comments must be a string' })
  comments?: string;
}

export const ManagementRegularTimingSchema = SchemaFactory.createForClass(
  ManagementRegularTiming,
);
