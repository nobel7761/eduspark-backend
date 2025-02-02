import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { Trim } from '../decorators/trim.decorator';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({ timestamps: true })
export class Subject {
  @Trim()
  @IsString({ message: 'Subject name must be a string' })
  @IsNotEmpty({ message: 'Subject name is required' })
  @Prop({ required: true, unique: true })
  name: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
