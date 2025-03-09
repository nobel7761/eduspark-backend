import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentType } from '../enums/earning.enum';

export class CreateEarningDto {
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  amount: number;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsString()
  class: string;

  @IsMongoId()
  studentId: string;

  @IsArray()
  @IsEnum(PaymentType, { each: true })
  paymentType: PaymentType[];

  @IsOptional()
  @IsString()
  month?: string;

  @IsMongoId()
  receivedBy: string;
}

export class UpdateEarningDto extends CreateEarningDto {}
