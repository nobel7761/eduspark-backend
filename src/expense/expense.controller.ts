import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @Get('monthly')
  findMonthlyExpenses(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) {
      throw new BadRequestException('Month and year parameters are required');
    }

    // Validate month format (01-12)
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Month must be between 01 and 12');
    }

    // Validate year format (YYYY)
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || year.length !== 4) {
      throw new BadRequestException('Year must be in YYYY format');
    }

    return this.expenseService.findMonthlyExpenses(monthNum, yearNum);
  }

  @Get('date-range')
  findExpensesByDateRange(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Validate dates if provided
    if (startDate && !this.isValidDate(startDate)) {
      throw new BadRequestException('Start date must be in YYYY-MM-DD format');
    }

    if (endDate && !this.isValidDate(endDate)) {
      throw new BadRequestException('End date must be in YYYY-MM-DD format');
    }

    return this.expenseService.findExpensesByDateRange(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }

  // @Get('expense-count/this-month')
  // async getThisMonthExpenseCount() {
  //   return {
  //     count: await this.expenseService.getThisMonthExpenseCount(),
  //   };
  // }

  // @Get('expense-count/total')
  // async getTotalExpenseCount() {
  //   return {
  //     count: await this.expenseService.getTotalExpenseCount(),
  //   };
  // }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
