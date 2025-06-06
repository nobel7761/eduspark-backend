import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthUser } from '../decorators/auth-user.decorator';
import { UserDocument } from '../users/user.model';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get('get-employee-for-submit-class-count')
  @UseGuards(JwtAuthGuard)
  getEmployeeForSubmitClassCount(@AuthUser() user: UserDocument) {
    return this.employeeService.getEmployeeForSubmitClassCount(user);
  }

  // @Get('employee-count/teachers')
  // async getTeachersCount() {
  //   return {
  //     count: await this.employeeService.getTeachersCount(),
  //   };
  // }

  @Get('/teachers')
  findAllTeachers() {
    return this.employeeService.findAllTeachers();
  }

  @Get('/class-based-teachers')
  findAllClassBasedTeachers() {
    return this.employeeService.findAllClassBasedTeachers();
  }

  @Get('/employees-without-director')
  findAllEmployeesWithoutDirector() {
    return this.employeeService.findAllEmployeesWithoutDirector();
  }

  @Get('/get-directors')
  findAllDirectors() {
    return this.employeeService.findAllDirectors();
  }

  @Get(':employeeId')
  findOne(@Param('employeeId') employeeId: string) {
    // Remove any whitespace and validate the employeeId format
    const trimmedEmployeeId = employeeId.trim();
    if (!trimmedEmployeeId) {
      throw new Error('Employee ID is required');
    }
    return this.employeeService.findOne(trimmedEmployeeId);
  }

  @Patch(':employeeId')
  update(
    @Param('employeeId') employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(employeeId, updateEmployeeDto);
  }

  @Delete('/bulk-delete')
  bulkDelete(@Body() employeeIds: string[]) {
    return this.employeeService.bulkDelete(employeeIds);
  }

  @Delete(':employeeId')
  remove(@Param('employeeId') employeeId: string) {
    return this.employeeService.remove(employeeId);
  }
}
