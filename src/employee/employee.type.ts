import { Types } from 'mongoose';
import { Gender, Group, EmployeeType } from '../enums/common.enum';
import { PaymentMethod } from '../enums/payment.enum';

export interface Parent {
  name: string;
  phone: string;
}

export interface UniversityEducation {
  institute: string;
  department: string;
  admissionYear?: number;
  passingYear?: number;
  cgpa?: number;
}

export interface SchoolEducation {
  institute: string;
  group: Group;
  year: number;
  result: number;
}

export interface EducationalBackground {
  university?: UniversityEducation;
  hsc: SchoolEducation;
  ssc: SchoolEducation;
}

export interface ClassPayment {
  classes: Types.ObjectId[];
  amount: number;
}

export interface Employee {
  firstName: string;
  lastName: string;
  shortName?: string;
  dateOfBirth: Date;
  gender: Gender;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  nidNumber?: string;
  presentAddress: string;
  permanentAddress?: string;
  father: Parent;
  mother: Parent;
  isCurrentlyStudying: boolean;
  educationalBackground: EducationalBackground;
  paymentMethod: PaymentMethod;
  paymentPerClass?: ClassPayment[];
  paymentPerMonth?: number;
  joiningDate: Date;
  employeeId: string;
  comments?: string;
  employeeType: EmployeeType;
}
