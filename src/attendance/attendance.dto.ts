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

  @IsOptional()
  @IsBoolean()
  isPresentOnTime?: boolean | null;

  @IsBoolean()
  absent: boolean;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsBoolean()
  isPresentOnTime?: boolean | null;

  @IsOptional()
  @IsBoolean()
  absent?: boolean;

  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsString()
  comments?: string;
}
