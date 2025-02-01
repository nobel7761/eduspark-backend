import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ManagementRegularTimingService } from './management-regular-timing.service';
import { ManagementRegularTimingController } from './management-regular-timing.controller';
import {
  ManagementRegularTiming,
  ManagementRegularTimingSchema,
} from './management-regular-timing.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ManagementRegularTiming.name,
        schema: ManagementRegularTimingSchema,
      },
    ]),
  ],
  controllers: [ManagementRegularTimingController],
  providers: [ManagementRegularTimingService],
})
export class ManagementRegularTimingModule {}
