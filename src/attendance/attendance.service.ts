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
import { AttendanceStatus } from '../enums/attandance.enum';

interface DateQuery {
  $gte?: Date;
  $lte?: Date;
}
interface AttendanceQuery {
  date?: DateQuery;
  status?: AttendanceStatus;
  employeeId?: string;
}

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

  async findByFilters(
    month: number,
    year: number,
    status?: AttendanceStatus,
    employeeId?: string,
  ) {
    try {
      const query: AttendanceQuery = {};

      // Create start and end dates for the specified month using UTC
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };

      // Add status filter if provided
      if (status) {
        query.status = status;
      }

      // Filter by employee name if provided
      if (employeeId) {
        query.employeeId = employeeId;
      }

      const attendanceQuery = this.attendanceModel
        .find(query)
        .populate('employeeId')
        .sort({ date: 1 });

      return attendanceQuery;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to fetch attendance records: ${error}`,
      );
    }
  }
}
