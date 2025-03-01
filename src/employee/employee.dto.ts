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
  IsArray,
  ValidateIf,
  IsBoolean,
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

class ClassDto {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  subjects: any[];

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsNumber()
  @IsOptional()
  __v?: number;
}

class ClassPaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassDto)
  classes: ClassDto[];

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  shortName?: string;

  @IsString()
  dateOfBirth: Date;

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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ParentDto)
  @ValidateIf((o: CreateEmployeeDto) => o.employeeType === EmployeeType.TEACHER)
  father?: ParentDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ParentDto)
  @ValidateIf((o: CreateEmployeeDto) => o.employeeType === EmployeeType.TEACHER)
  mother?: ParentDto;

  @IsOptional()
  isCurrentlyStudying?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EducationalBackgroundDto)
  @ValidateIf((o: CreateEmployeeDto) => o.employeeType === EmployeeType.TEACHER)
  educationalBackground?: EducationalBackgroundDto;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassPaymentDto)
  @ValidateIf(
    (o: CreateEmployeeDto) => o.paymentMethod === PaymentMethod.PerClass,
  )
  paymentPerClass?: ClassPaymentDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf(
    (o: CreateEmployeeDto) => o.paymentMethod === PaymentMethod.Monthly,
  )
  paymentPerMonth?: number;

  @IsOptional()
  joiningDate?: Date;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsBoolean()
  isDirector?: boolean;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {
  @IsOptional()
  joiningDate?: Date;
}
