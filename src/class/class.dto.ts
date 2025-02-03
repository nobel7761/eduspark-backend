import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';

class SubjectDto {
  @IsString()
  _id: Types.ObjectId;
}

export class CreateClassDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectDto)
  subjects: SubjectDto[];
}

export class UpdateClassDto extends PartialType(CreateClassDto) {}
