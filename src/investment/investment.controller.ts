import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto, UpdateInvestmentDto } from './investment.dto';

@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  create(@Body() createInvestmentDto: CreateInvestmentDto) {
    return this.investmentService.create(createInvestmentDto);
  }

  @Get()
  findAll() {
    return this.investmentService.findAll();
  }

  @Get('reports')
  findAllInvestmentReports() {
    return this.investmentService.findAllInvestmentReports();
  }

  @Get('employee')
  findByEmployeeAndDate(
    @Query('employeeId') employeeId: string,
    @Query('date') date: Date,
  ) {
    return this.investmentService.findByEmployeeAndDate(employeeId, date);
  }

  @Get('total/:employeeId')
  getTotalInvestmentByEmployee(@Param('employeeId') employeeId: string) {
    return this.investmentService.getTotalInvestmentByEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
  ) {
    return this.investmentService.update(id, updateInvestmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentService.remove(id);
  }

  // @Get('investment-count/total')
  // async getTotalInvestmentCount() {
  //   return {
  //     count: await this.investmentService.getTotalInvestmentCount(),
  //   };
  // }
}
