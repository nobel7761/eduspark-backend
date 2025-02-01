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
import { DirectorsService } from './directors.service';
import { CreateDirectorDto, UpdateDirectorDto } from './director.dto';
// import { JwtAuthGuard } from '../guards';

@Controller('directors')
// @UseGuards(JwtAuthGuard)
export class DirectorsController {
  constructor(private readonly directorsService: DirectorsService) {}

  @Post()
  async create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorsService.create(createDirectorDto);
  }

  @Get()
  findAll() {
    return this.directorsService.findAll();
  }

  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.directorsService.findOneByEmail(email);
  }

  @Patch(':email')
  update(
    @Param('email') email: string,
    @Body() updateDirectorDto: UpdateDirectorDto,
  ) {
    return this.directorsService.update(email, updateDirectorDto);
  }

  @Delete(':email')
  remove(@Param('email') email: string) {
    return this.directorsService.remove(email);
  }
}
