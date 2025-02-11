import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // UseGuards,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';
// import { JwtAuthGuard } from '../guards';

@Controller('subjects')
// @UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post('')
  create(@Body() subjects: CreateSubjectDto[]) {
    return this.subjectService.create(subjects);
  }

  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }
}
