import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { Gender, Group, EmployeeType } from '../enums/common.enum';
import { PaymentMethod } from '../enums/payment.enum';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema()
class Parent {
  @IsString()
  @Prop({ required: true, message: 'Parent Name is required' })
  name: string;

  @IsString()
  @Prop({ required: true, message: 'Parent Phone is required' })
  phone: string;
}

@Schema()
class UniversityEducation {
  @IsString()
  @Prop({ required: true, message: 'Institute is required' })
  institute: string;

  @IsString()
  @Prop({ required: true, message: 'Department is required' })
  department: string;

  @IsOptional()
  @IsNumber()
  @Prop()
  admissionYear?: number;

  @IsOptional()
  @IsNumber()
  @Prop()
  passingYear?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  @Prop()
  cgpa?: number;
}

@Schema()
class SchoolEducation {
  @IsString()
  @Prop({ required: true, message: 'Institute is required' })
  institute: string;

  @IsString()
  @IsEnum(Group)
  @Prop({ required: true, enum: Group, message: 'Group is required' })
  group: Group;

  @IsNumber()
  @Prop({ required: true, message: 'Year is required' })
  year: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  @Prop({ required: true, message: 'Result is required' })
  result: number;
}

@Schema()
class EducationalBackground {
  @IsObject()
  @ValidateNested()
  @Prop({ type: UniversityEducation, required: false })
  university: UniversityEducation;

  @IsObject()
  @ValidateNested()
  @Prop({ type: SchoolEducation, required: true, message: 'HSC is required' })
  hsc: SchoolEducation;

  @IsObject()
  @ValidateNested()
  @Prop({ type: SchoolEducation, required: true, message: 'SSC is required' })
  ssc: SchoolEducation;
}

@Schema()
class ClassPayment {
  @Prop({ type: [{ type: Object }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassDto)
  classes: ClassDto[];

  @Prop({ required: true })
  @IsNumber()
  @Min(0)
  amount: number;
}

@Schema()
class ClassDto {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsArray()
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

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, message: 'First name is required' })
  @IsString()
  firstName: string;

  @Prop({ required: true, message: 'Last name is required' })
  @IsString()
  lastName: string;

  @Prop()
  @IsOptional()
  @IsString()
  shortName?: string;

  @Prop({ required: true, message: 'Date of birth is required' })
  @IsString()
  dateOfBirth: Date;

  @Prop({ required: true, enum: Gender, message: 'Gender is required' })
  @IsEnum(Gender)
  gender: Gender;

  @Prop({ required: true, message: 'Primary phone is required' })
  @IsString()
  primaryPhone: string;

  @Prop()
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  // @Prop()
  // @IsString()
  // @IsOptional()
  // photo?: string;

  @Prop()
  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: string | null | undefined }) =>
    value ? value.toLowerCase() : value,
  )
  email?: string;

  @Prop()
  @IsOptional()
  @IsString()
  nidNumber?: string;

  // @Prop({ type: [Object] })
  // @IsOptional()
  // attachments?: Array<{ [key: string]: string }>;

  @Prop({ required: true, message: 'Present address is required' })
  @IsString()
  presentAddress: string;

  @Prop()
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @Prop({
    type: Parent,
    required: function (this: Employee) {
      return this.employeeType === EmployeeType.TEACHER;
    },
  })
  @IsObject()
  @ValidateNested()
  father: Parent;

  @Prop({
    type: Parent,
    required: function (this: Employee) {
      return this.employeeType === EmployeeType.TEACHER;
    },
  })
  @IsObject()
  @ValidateNested()
  mother: Parent;

  @Prop({
    required: true,
    default: false,
  })
  isCurrentlyStudying: boolean;

  @Prop({
    type: EducationalBackground,
    required: function (this: Employee) {
      return this.employeeType === EmployeeType.TEACHER;
    },
  })
  @IsObject()
  @ValidateNested()
  educationalBackground: EducationalBackground;

  @Prop({
    required: true,
    enum: PaymentMethod,
    message: 'Payment method is required',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Prop({ type: [{ type: ClassPayment }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassPayment)
  paymentPerClass?: ClassPayment[];

  @Prop()
  @IsOptional()
  @IsNumber()
  paymentPerMonth?: number;

  @Prop({ type: Date })
  joiningDate: Date;

  @Prop({ required: true, unique: true })
  @IsString()
  employeeId: string;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  comments?: string;

  @Prop({
    required: true,
    enum: EmployeeType,
    message: 'Employee type is required',
  })
  @IsEnum(EmployeeType)
  employeeType: EmployeeType;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
