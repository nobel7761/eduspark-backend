import { IsString, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSubjectDto {
  @IsString({ message: 'Subject name must be a string' })
  @IsNotEmpty({ message: 'Subject name is required' })
  name: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
