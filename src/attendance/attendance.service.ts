import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './attendance.model';
import { CreateAttendanceDto } from './attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    // const attendance = new this.attendanceModel(createAttendanceDto);
    const attendance = await this.attendanceModel.create(createAttendanceDto);
    return attendance;
  }

  async findAll() {
    return await this.attendanceModel.find().sort({ date: -1 });
  }

  async findOne(id: string) {
    const attendance = await this.attendanceModel.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: Partial<CreateAttendanceDto>) {
    const attendance = await this.attendanceModel.findByIdAndUpdate(
      id,
      updateAttendanceDto,
      { new: true },
    );
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }

  async remove(id: string) {
    const attendance = await this.attendanceModel.findByIdAndDelete(id);
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }
}
