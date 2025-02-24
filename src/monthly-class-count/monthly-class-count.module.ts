import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyClassCountService } from './monthly-class-count.service';
import { MonthlyClassCountController } from './monthly-class-count.controller';
import {
  MonthlyClassCount,
  MonthlyClassCountSchema,
} from './monthly-class-count.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MonthlyClassCount.name, schema: MonthlyClassCountSchema },
    ]),
  ],
  controllers: [MonthlyClassCountController],
  providers: [MonthlyClassCountService],
  exports: [MonthlyClassCountService],
})
export class MonthlyClassCountModule {}
