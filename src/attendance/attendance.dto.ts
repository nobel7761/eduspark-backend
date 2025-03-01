import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsMongoId()
  employeeId: string;

  @IsDateString()
  date: Date;

  @IsBoolean()
  isPresentOnTime: boolean;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsBoolean()
  isPresentOnTime?: boolean;

  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsString()
  comments?: string;
}
