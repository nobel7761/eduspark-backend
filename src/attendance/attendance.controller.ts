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
  // UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
// import { JwtAuthGuard } from '../guards';
import { CreateAttendanceDto, UpdateAttendanceDto } from './attendance.dto';
import { AttendanceStatus } from '../enums/attandance.enum';

@Controller('attendance')
// @UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('filter')
  async findByFilters(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('status') status?: AttendanceStatus,
    @Query('employeeId') employeeId?: string,
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

    return this.attendanceService.findByFilters(
      monthNum,
      yearNum,
      status,
      employeeId,
    );
  }

  @Get('employee')
  findByEmployeeAndDate(
    @Query('employeeId') employeeId: string,
    @Query('date') date: Date,
  ) {
    return this.attendanceService.findByEmployeeAndDate(employeeId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
