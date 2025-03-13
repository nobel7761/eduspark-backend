import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInvestmentDto {
  @IsMongoId()
  employeeId: string;

  @IsDateString()
  date: Date;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class UpdateInvestmentDto {
  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
