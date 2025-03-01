import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './attendance.model';
import { CreateAttendanceDto, UpdateAttendanceDto } from './attendance.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    private configService: ConfigService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      // Check if attendance already exists for this employee on the given date
      const existingAttendance = await this.attendanceModel.findOne({
        employeeId: createAttendanceDto.employeeId,
        date: createAttendanceDto.date,
      });

      if (existingAttendance) {
        throw new BadRequestException(
          'Attendance record already exists for this date',
        );
      }

      const attendance = await this.attendanceModel.create(createAttendanceDto);
      return await attendance.populate('employeeId');
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Failed to create attendance record: ${error}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.attendanceModel
        .find()
        .populate('employeeId')
        .sort({ date: -1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch attendance records: ${error}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const attendance = await this.attendanceModel
        .findById(id)
        .populate('employeeId');
      if (!attendance) {
        throw new NotFoundException('Attendance record not found');
      }
      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to fetch attendance record: ${error}`,
      );
    }
  }

  async findByEmployeeAndDate(employeeId: string, date: Date) {
    try {
      const attendance = await this.attendanceModel
        .findOne({ employeeId, date })
        .populate('employeeId');
      if (!attendance) {
        throw new NotFoundException('Attendance record not found');
      }
      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to fetch attendance record: ${error}`,
      );
    }
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    try {
      const attendance = await this.attendanceModel
        .findByIdAndUpdate(id, updateAttendanceDto, { new: true })
        .populate('employeeId');

      if (!attendance) {
        throw new NotFoundException('Attendance record not found');
      }
      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to update attendance record: ${error}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const attendance = await this.attendanceModel
        .findByIdAndDelete(id)
        .populate('employeeId');
      if (!attendance) {
        throw new NotFoundException('Attendance record not found');
      }
      return { message: 'Attendance record deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to delete attendance record: ${error}`,
      );
    }
  }

  async findCurrentMonthByEmployeeId(employeeId: string) {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const attendanceRecords = await this.attendanceModel
        .find({
          employeeId,
          date: {
            $gte: startOfMonth.toISOString().split('T')[0],
            $lte: endOfMonth.toISOString().split('T')[0],
          },
        })
        .populate('employeeId')
        .sort({ date: 1 });

      const totalDays = attendanceRecords.length;
      const presentOnTimeDays = attendanceRecords.filter(
        (record) => record.isPresentOnTime,
      ).length;
      const lateOrAbsentDays = totalDays - presentOnTimeDays;

      return {
        employee: attendanceRecords[0]?.employeeId || null,
        totalDays,
        presentOnTimeDays,
        lateOrAbsentDays,
        records: attendanceRecords,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch monthly attendance: ${error}`,
      );
    }
  }
}
