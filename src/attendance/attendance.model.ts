import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../enums/attandance.enum';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsDateString()
  @Prop({ type: Date, required: true })
  date: Date;

  @IsEnum(AttendanceStatus)
  @Prop({ type: String, enum: AttendanceStatus, required: true })
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  @Prop({ default: '' })
  comments: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
