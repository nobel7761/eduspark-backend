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
import { EarningService } from './earning.service';
import { CreateEarningDto, UpdateEarningDto } from './earning.dto';

@Controller('earnings')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}

  @Post()
  create(@Body() createEarningDto: CreateEarningDto) {
    return this.earningService.create(createEarningDto);
  }

  @Get()
  findAll() {
    return this.earningService.findAll();
  }

  @Get('monthly')
  findMonthlyEarnings(
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

    return this.earningService.findMonthlyEarnings(monthNum, yearNum);
  }

  @Get('student/:studentId')
  findStudentEarnings(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }

    // Validate dates if provided
    if (startDate && !this.isValidDate(startDate)) {
      throw new BadRequestException('Start date must be in YYYY-MM-DD format');
    }

    if (endDate && !this.isValidDate(endDate)) {
      throw new BadRequestException('End date must be in YYYY-MM-DD format');
    }

    return this.earningService.findStudentEarnings(
      studentId,
      startDate,
      endDate,
    );
  }

  @Get('earning-count/this-month')
  async getThisMonthEarningCount() {
    return {
      count: await this.earningService.getThisMonthEarningCount(),
    };
  }

  @Get('earning-count/total')
  async getTotalEarningCount() {
    return {
      count: await this.earningService.getTotalEarningCount(),
    };
  }

  @Get('total-profit')
  async getTotalProfit() {
    return {
      count: await this.earningService.getTotalProfit(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.earningService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEarningDto: UpdateEarningDto) {
    return this.earningService.update(id, updateEarningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.earningService.remove(id);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
