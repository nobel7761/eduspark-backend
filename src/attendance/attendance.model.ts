import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsDateString, IsString, IsOptional } from 'class-validator';
import { Trim } from '../decorators/trim.decorator';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Attendance {
  @Trim()
  @IsString()
  @Prop({ required: true })
  staffId: string;

  @Trim()
  @IsString()
  @Prop({ required: true })
  staffName: string;

  @IsDateString()
  @Prop({ required: true })
  date: string;

  @IsString()
  @Prop({ required: true })
  inTime: string;

  @IsString()
  @Prop({ required: true })
  outTime: string;

  @IsOptional()
  @IsString()
  @Prop({ default: '' })
  comments: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
