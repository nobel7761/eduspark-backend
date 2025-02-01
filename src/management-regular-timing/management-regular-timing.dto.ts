import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TimingDto {
  @IsDateString()
  inTime: string;

  @IsDateString()
  outTime: string;
}

export class CreateManagementRegularTimingDto {
  @IsMongoId()
  directorId: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimingDto)
  timings: TimingDto[];

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateManagementRegularTimingDto {
  @IsOptional()
  @IsMongoId()
  directorId?: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimingDto)
  timings: TimingDto[];

  @IsOptional()
  @IsString()
  comments?: string;
}
