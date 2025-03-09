import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EarningService } from './earning.service';
import { EarningController } from './earning.controller';
import { Earning, EarningSchema } from './earning.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Earning.name, schema: EarningSchema }]),
  ],
  controllers: [EarningController],
  providers: [EarningService],
  exports: [EarningService],
})
export class EarningModule {}
