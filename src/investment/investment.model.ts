import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  @IsMongoId()
  employeeId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  @IsDateString()
  date: Date;

  @Prop({ required: true })
  @IsNumber()
  @Min(0)
  amount: number;

  @Prop()
  @IsOptional()
  @IsString()
  comments?: string;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
