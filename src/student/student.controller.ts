import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './student.dto';

@Controller('students')
// @UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    try {
      const result = await this.studentService.create(createStudentDto);
      return result;
    } catch (error) {
      console.error('Error creating student:', error);
      if (error) {
        throw new BadRequestException(error);
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':studentId')
  findOne(@Param('studentId') studentId: string) {
    return this.studentService.findOne(studentId);
  }

  @Patch(':studentId')
  update(
    @Param('studentId') studentId: string,
    @Body() updateStudentDto: Partial<CreateStudentDto>,
  ) {
    return this.studentService.update(studentId, updateStudentDto);
  }

  @Delete('/bulk-delete')
  bulkDelete(@Body() studentIds: string[]) {
    return this.studentService.bulkDelete(studentIds);
  }

  @Delete(':studentId')
  remove(@Param('studentId') studentId: string) {
    return this.studentService.remove(studentId);
  }

  @Get('student-count/total')
  async getTotalStudentsCount() {
    return {
      count: await this.studentService.getStudentsCount(),
    };
  }

  @Get('student-count/by-gender')
  async getStudentsCountByGender() {
    return await this.studentService.getStudentsCountByGender();
  }

  @Get('student-count/by-class')
  async getStudentsCountByClass() {
    return await this.studentService.getStudentsCountByClass();
  }
}
