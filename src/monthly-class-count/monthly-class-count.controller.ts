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
import { MonthlyClassCountService } from './monthly-class-count.service';
import {
  CreateMonthlyClassCountDto,
  UpdateMonthlyClassCountDto,
} from './monthly-class-count.dto';

@Controller('monthly-class-count')
export class MonthlyClassCountController {
  constructor(
    private readonly monthlyClassCountService: MonthlyClassCountService,
  ) {}

  @Post()
  create(@Body() createDto: CreateMonthlyClassCountDto) {
    return this.monthlyClassCountService.create(createDto);
  }

  @Get()
  findAll() {
    return this.monthlyClassCountService.findAll();
  }

  @Get('current-month')
  findCurrentMonthClassCountForClassBasedEmployees() {
    const currentDate = new Date();
    return this.monthlyClassCountService.findCurrentMonthClassCountForClassBasedEmployees(
      currentDate,
    );
  }

  @Get('employee')
  findByEmployeeAndDate(
    @Query('employeeId') employeeId: string,
    @Query('date') date: Date,
  ) {
    return this.monthlyClassCountService.findByEmployeeAndDate(
      employeeId,
      date,
    );
  }

  @Get('filter')
  findByFilters(@Query('month') month: string, @Query('year') year: string) {
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

    return this.monthlyClassCountService.findByFilters(monthNum, yearNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monthlyClassCountService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMonthlyClassCountDto,
  ) {
    return this.monthlyClassCountService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monthlyClassCountService.remove(id);
  }
}
