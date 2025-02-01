import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { HydratedDocument, Document } from 'mongoose';
import { Trim } from '../decorators/trim.decorator';

export type DirectorDocument = HydratedDocument<Director>;

@Schema({ timestamps: true })
export class Director extends Document {
  @Trim()
  @IsString({ message: 'Name is required' })
  @Prop({ required: true })
  name: string;

  @Trim()
  @Transform(({ value }: { value: string }) =>
    value ? value.toLowerCase() : '',
  )
  @IsEmail({}, { message: 'Invalid email' })
  @Prop({ required: true, unique: true })
  email: string;

  @Trim()
  @IsString({ message: 'Primary phone is required' })
  @Prop({ required: true, unique: true })
  primaryPhone: string;

  @Trim()
  @IsOptional()
  @IsString()
  @Prop()
  secondaryPhone?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Prop({ required: true, min: 0, max: 100 })
  sharePercentage: number;
}

export const DirectorSchema = SchemaFactory.createForClass(Director);
