import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ClassCountDto {
  @IsArray()
  @IsMongoId({ each: true })
  classIds: string[];

  @IsNumber()
  count: number;

  @IsOptional()
  @IsString()
  comments?: string;
}

class ProxyClassDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  classId: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreateMonthlyClassCountDto {
  @IsMongoId()
  employeeId: string;

  @IsDateString()
  date: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassCountDto)
  classes: ClassCountDto[];

  @IsBoolean()
  hasProxyClass: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProxyClassDto)
  proxyClasses?: ProxyClassDto[];
}

export class UpdateMonthlyClassCountDto extends CreateMonthlyClassCountDto {}
