import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  // UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
// import { JwtAuthGuard } from '../guards';
import { CreateAttendanceDto, UpdateAttendanceDto } from './attendance.dto';

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

  @Get('employee')
  findByEmployeeAndDate(
    @Query('employeeId') employeeId: string,
    @Query('date') date: Date,
  ) {
    return this.attendanceService.findByEmployeeAndDate(employeeId, date);
  }

  @Get('employee/:employeeId/current-month')
  findCurrentMonthByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.attendanceService.findCurrentMonthByEmployeeId(employeeId);
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
