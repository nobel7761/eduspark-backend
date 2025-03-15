import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Earning } from './earning.model';
import { CreateEarningDto, UpdateEarningDto } from './earning.dto';
import { StudentService } from '../student/student.service';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PaymentType } from '../enums/earning.enum';

interface DateQuery {
  $gte?: Date;
  $lte?: Date;
}

interface StudentEarningQuery {
  studentId: string;
  date?: DateQuery;
}

interface EarningAggregateResult {
  _id: null;
  totalAmount: number;
}

@Injectable()
export class EarningService {
  private studentService: StudentService;
  constructor(
    @InjectModel(Earning.name) private earningModel: Model<Earning>,
    private moduleRef: ModuleRef,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.studentService = this.moduleRef.get(StudentService, {
      strict: false,
    });
  }

  async create(createEarningDto: CreateEarningDto) {
    try {
      // Verify student exists
      await this.studentService.findByStudentObjectId(
        createEarningDto.studentId,
      );

      // Check if any payment type already exists for this student on the given date
      const existingPayment = await this.earningModel.findOne({
        _id: createEarningDto.studentId,
        date: createEarningDto.date,
        paymentType: { $in: createEarningDto.paymentType },
      });

      if (existingPayment) {
        throw new BadRequestException(
          `Payment already exists for this student on ${createEarningDto.date.toISOString()}`,
        );
      }

      const earning = await this.earningModel.create(createEarningDto);
      return earning.populate(['studentId', 'receivedBy']);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to create earning: ${error}`);
    }
  }

  async findAll() {
    try {
      return await this.earningModel
        .find()
        .populate(['studentId', 'receivedBy'])
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch earnings: ${error}`);
    }
  }

  async findOne(id: string) {
    try {
      const earning = await this.earningModel
        .findById(id)
        .populate(['studentId', 'receivedBy']);
      if (!earning) {
        throw new NotFoundException('Earning not found');
      }
      return earning;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to fetch earning: ${error}`);
    }
  }

  async update(id: string, updateEarningDto: UpdateEarningDto) {
    try {
      const earning = await this.earningModel
        .findByIdAndUpdate(id, updateEarningDto, { new: true })
        .populate(['studentId', 'receivedBy']);

      if (!earning) {
        throw new NotFoundException('Earning not found');
      }
      return earning;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update earning: ${error}`);
    }
  }

  async remove(id: string) {
    try {
      const earning = await this.earningModel.findByIdAndDelete(id);
      if (!earning) {
        throw new NotFoundException('Earning not found');
      }
      return { message: 'Earning deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to delete earning: ${error}`);
    }
  }

  async findMonthlyEarnings(month: number, year: number) {
    try {
      // Create start and end dates for the specified month using UTC
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      // Find all earnings for the specified month
      const earnings = await this.earningModel
        .find({
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        })
        .populate(['studentId', 'receivedBy'])
        .sort({ date: -1 })
        .lean();

      // Calculate total earnings
      const totalEarning = earnings.reduce(
        (sum, earning) => sum + earning.amount,
        0,
      );

      // Group earnings by payment type with custom grouping
      const earningsByType = earnings.reduce(
        (acc, earning) => {
          // Check if the payment includes monthly fee
          if (earning.paymentType.includes(PaymentType.MONTHLY_FEE)) {
            if (!acc[PaymentType.MONTHLY_FEE]) {
              acc[PaymentType.MONTHLY_FEE] = 0;
            }
            acc[PaymentType.MONTHLY_FEE] += earning.amount;
          } else {
            // If it's not monthly fee, it goes to Admission/Form Fee
            if (!acc['Admission/Form Fee']) {
              acc['Admission/Form Fee'] = 0;
            }
            acc['Admission/Form Fee'] += earning.amount;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        earnings,
        totalEarning,
        earningsByType,
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        year: year,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch monthly earnings: ${error}`,
      );
    }
  }

  async findStudentEarnings(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const query: StudentEarningQuery = { studentId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    return this.earningModel
      .find(query)
      .sort({ date: -1 })
      .populate(['studentId', 'receivedBy'])
      .exec();
  }

  async getThisMonthEarningCount(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const result = await this.earningModel.aggregate<EarningAggregateResult>([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  }

  async getTotalEarningCount(): Promise<number> {
    const result = await this.earningModel.aggregate<EarningAggregateResult>([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  }
}
