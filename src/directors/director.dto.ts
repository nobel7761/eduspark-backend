import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDirectorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  primaryPhone: string;

  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  sharePercentage: number;
}

export class UpdateDirectorDto extends PartialType(CreateDirectorDto) {}
