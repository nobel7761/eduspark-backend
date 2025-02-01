import { PickType } from '@nestjs/mapped-types';
import { Attendance } from './attendance.model';

export class CreateAttendanceDto extends PickType(Attendance, [
  'staffId',
  'staffName',
  'date',
  'inTime',
  'outTime',
  'comments',
] as const) {}

export class UpdateAttendanceDto extends PickType(Attendance, [
  'inTime',
  'outTime',
  'comments',
] as const) {}
