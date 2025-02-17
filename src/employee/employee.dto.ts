import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Gender, Group, EmployeeType } from '../enums/common.enum';
import { PaymentMethod } from '../enums/payment.enum';

class ParentDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;
}

class UniversityEducationDto {
  @IsString()
  institute: string;

  @IsString()
  department: string;

  @IsOptional()
  @IsNumber()
  admissionYear?: number;

  @IsOptional()
  @IsNumber()
  passingYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  cgpa?: number;
}

class SchoolEducationDto {
  @IsString()
  institute: string;

  @IsEnum(Group)
  group: Group;

  @IsNumber()
  year: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  result: number;
}

class EducationalBackgroundDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UniversityEducationDto)
  @IsOptional()
  university?: UniversityEducationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SchoolEducationDto)
  hsc: SchoolEducationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SchoolEducationDto)
  ssc: SchoolEducationDto;
}

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(EmployeeType)
  employeeType: EmployeeType;

  @IsString()
  primaryPhone: string;

  @IsOptional()
  secondaryPhone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  nidNumber?: string;

  @IsString()
  presentAddress: string;

  @IsOptional()
  permanentAddress?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ParentDto)
  father: ParentDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ParentDto)
  mother: ParentDto;

  @IsOptional()
  isCurrentlyStudying?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => EducationalBackgroundDto)
  educationalBackground: EducationalBackgroundDto;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentPerClass?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentPerMonth?: number;

  @IsOptional()
  joiningDate?: Date;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {
  @IsOptional()
  joiningDate?: Date;
}
