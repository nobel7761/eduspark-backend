import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ManagementRegularTimingService } from './management-regular-timing.service';
import {
  CreateManagementRegularTimingDto,
  UpdateManagementRegularTimingDto,
} from './management-regular-timing.dto';

@Controller('management-regular-timing')
export class ManagementRegularTimingController {
  constructor(
    private readonly managementRegularTimingService: ManagementRegularTimingService,
  ) {}

  @Post()
  create(@Body() createDto: CreateManagementRegularTimingDto) {
    return this.managementRegularTimingService.create(createDto);
  }

  @Get()
  findAll() {
    return this.managementRegularTimingService.findAll();
  }

  @Get('director/:directorId/current-month')
  findCurrentMonthByDirectorId(@Param('directorId') directorId: string) {
    return this.managementRegularTimingService.findCurrentMonthByDirectorId(
      directorId,
    );
  }

  @Get('director/:directorId')
  findAllByDirectorId(@Param('directorId') directorId: string) {
    return this.managementRegularTimingService.findAllByDirectorId(directorId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateManagementRegularTimingDto,
  ) {
    return this.managementRegularTimingService.update(id, updateDto);
  }

  @Delete('specificDate/:directorId')
  removeSpecificTimingByDirectorId(
    @Param('directorId') directorId: string,
    @Body('date') date: string,
  ) {
    return this.managementRegularTimingService.removeSpecificTimingByDirectorId(
      directorId,
      date,
    );
  }

  @Get('current-month')
  findAllCurrentMonth() {
    return this.managementRegularTimingService.findAllCurrentMonth();
  }
}
