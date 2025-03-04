import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  @Prop({ type: Boolean, required: false, default: null })
  isPresentOnTime: boolean | null;

  @IsBoolean()
  @Prop({ required: true, default: false })
  absent: boolean;

  @IsOptional()
  @IsString()
  @Prop({ default: '' })
  comments: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
