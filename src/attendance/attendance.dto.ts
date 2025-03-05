import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../enums/attandance.enum';

export class CreateAttendanceDto {
  @IsMongoId()
  employeeId: string;

  @IsDateString()
  date: Date;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}
