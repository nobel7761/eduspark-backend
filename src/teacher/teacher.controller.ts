import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  //   UseGuards,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto, UpdateTeacherDto } from './teacher.dto';
// import { JwtAuthGuard } from '../guards';

@Controller('teachers')
// @UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':teacherId')
  findOne(@Param('teacherId') teacherId: string) {
    // Remove any whitespace and validate the teacherId format
    const trimmedTeacherId = teacherId.trim();
    if (!trimmedTeacherId) {
      throw new Error('Teacher ID is required');
    }
    return this.teacherService.findOne(trimmedTeacherId);
  }

  @Patch(':teacherId')
  update(
    @Param('teacherId') teacherId: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(teacherId, updateTeacherDto);
  }

  @Delete('/bulk-delete')
  bulkDelete(@Body() teacherIds: string[]) {
    return this.teacherService.bulkDelete(teacherIds);
  }

  @Delete(':teacherId')
  remove(@Param('teacherId') teacherId: string) {
    return this.teacherService.remove(teacherId);
  }
}
