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
import { ExpenseType } from '../enums/expense.enum';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  amount: number;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsArray()
  @IsEnum(ExpenseType, { each: true })
  purpose: ExpenseType[];

  @IsMongoId()
  paidBy: string;
}

export class UpdateExpenseDto extends CreateExpenseDto {}
