import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { Subject } from '../subject/subject.model';

export type ClassDocument = HydratedDocument<Class>;

@Schema({ timestamps: true })
export class Class {
  @IsString({ message: 'Class name must be a string' })
  @Prop({ required: true, unique: true })
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Prop([{ type: Types.ObjectId, ref: Subject.name }])
  subjects: Subject[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);
