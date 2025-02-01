import { OmitType } from '@nestjs/mapped-types';
import { Student } from './student.model';

export class CreateStudentDto extends OmitType(Student, [
  'studentId',
] as const) {}
