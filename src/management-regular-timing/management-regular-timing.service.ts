import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { ManagementRegularTiming } from './management-regular-timing.model';
import {
  CreateManagementRegularTimingDto,
  UpdateManagementRegularTimingDto,
} from './management-regular-timing.dto';
import { Director } from '../directors/director.model';

interface DirectorTiming {
  director: Director & Document;
  totalMonthlyHours: number;
}

interface DirectorTimingsMap {
  [key: string]: DirectorTiming;
}

@Injectable()
export class ManagementRegularTimingService {
  constructor(
    @InjectModel(ManagementRegularTiming.name)
    private managementRegularTimingModel: Model<ManagementRegularTiming>,
  ) {}

  private calculateTotalHours(
    timings: { inTime: string; outTime: string }[],
  ): number {
    const total = timings.reduce((total, timing) => {
      const inTime = new Date(timing.inTime);
      const outTime = new Date(timing.outTime);
      const diffInHours =
        (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
      return total + diffInHours;
    }, 0);
    return Number(total.toFixed(2));
  }

  async create(createDto: CreateManagementRegularTimingDto) {
    // Check if timing already exists for the director on the given date
    const existingTiming = await this.managementRegularTimingModel.findOne({
      directorId: createDto.directorId,
      date: createDto.date,
    });

    if (existingTiming) {
      throw new BadRequestException(
        'Timing already exists for this director on the given date',
      );
    }

    const totalHours = this.calculateTotalHours(createDto.timings);
    const timing = await this.managementRegularTimingModel.create({
      ...createDto,
      totalHours,
    });
    return timing;
  }

  async findAll() {
    return await this.managementRegularTimingModel
      .find()
      .populate('directorId')
      .sort({ date: -1 });
  }

  async findCurrentMonthByDirectorId(directorId: string) {
    const currentDate = new Date();
    // Format dates as YYYY-MM-DD strings
    const startOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
    const endOfMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

    const timings = await this.managementRegularTimingModel
      .find({
        directorId,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .populate('directorId');

    const totalMonthlyHours = Number(
      timings
        .reduce((total, record) => total + record.totalHours, 0)
        .toFixed(2),
    );

    // Return only director details and total hours
    return {
      director: timings[0]?.directorId || null,
      totalMonthlyHours,
    };
  }

  async findAllByDirectorId(directorId: string) {
    const timings = await this.managementRegularTimingModel
      .find({ directorId })
      .populate('directorId')
      .sort({ date: -1 });

    const totalHours = Number(
      timings
        .reduce((total, record) => total + record.totalHours, 0)
        .toFixed(2),
    );

    return {
      timings,
      totalHours,
    };
  }

  async update(id: string, updateDto: UpdateManagementRegularTimingDto) {
    // First check if the record exists
    const existingTiming = await this.managementRegularTimingModel.findOne({
      directorId: id,
      date: updateDto.date,
    });

    if (!existingTiming) {
      throw new NotFoundException(
        'No timing record found for this director on the given date',
      );
    }

    const totalHours = this.calculateTotalHours(updateDto.timings);
    const timing = await this.managementRegularTimingModel
      .findOneAndUpdate(
        { directorId: id },
        {
          ...updateDto,
          totalHours,
        },
        { new: true },
      )
      .populate('directorId');

    return timing;
  }

  async removeSpecificTimingByDirectorId(directorId: string, date: string) {
    const timing = await this.managementRegularTimingModel.findOneAndDelete({
      directorId,
      date,
    });
    if (!timing) {
      throw new NotFoundException('Management regular timing not found');
    }
    return { message: 'Management regular timing deleted successfully' };
  }

  async findAllCurrentMonth() {
    const currentDate = new Date();
    const startOfMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}-01`;
    const endOfMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ).getDate(),
    ).padStart(2, '0')}`;

    const timings = await this.managementRegularTimingModel
      .find({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .populate('directorId')
      .sort({ date: -1 });

    // Group timings by directorId and calculate total hours
    const directorTimings = timings.reduce<DirectorTimingsMap>(
      (acc, timing) => {
        const directorId = timing.directorId._id;
        if (!acc[directorId as string]) {
          acc[directorId as string] = {
            director: timing.directorId,
            totalMonthlyHours: 0,
          };
        }
        acc[directorId as string].totalMonthlyHours += timing.totalHours;
        return acc;
      },
      {},
    );

    // Transform to final simplified array format
    return Object.entries(directorTimings).map(([directorId, data]) => ({
      directorId,
      directorName: data.director.name,
      totalHours: Number(data.totalMonthlyHours.toFixed(2)),
    }));
  }
}
