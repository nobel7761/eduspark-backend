import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonthlyClassCount } from './monthly-class-count.model';
import {
  CreateMonthlyClassCountDto,
  UpdateMonthlyClassCountDto,
} from './monthly-class-count.dto';
import { ModuleRef } from '@nestjs/core';
import { EmployeeService } from '../employee/employee.service';
import { IClassPopulated } from 'src/class/class.types';

@Injectable()
export class MonthlyClassCountService {
  private employeeService: EmployeeService;
  constructor(
    @InjectModel(MonthlyClassCount.name)
    private monthlyClassCountModel: Model<MonthlyClassCount>,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.employeeService = this.moduleRef.get(EmployeeService, {
      strict: false,
    });
  }

  async create(createDto: CreateMonthlyClassCountDto) {
    try {
      // Check if record already exists for the employee on the given date
      const existingRecord = await this.monthlyClassCountModel.findOne({
        employeeId: createDto.employeeId,
        date: createDto.date,
      });

      if (existingRecord) {
        throw new BadRequestException('Record already exists for this date');
      }

      // Validate proxy classes data
      if (
        createDto.hasProxyClass &&
        (!createDto.proxyClasses || createDto.proxyClasses.length === 0)
      ) {
        throw new BadRequestException(
          'Proxy classes are required when hasProxyClass is true',
        );
      }

      if (!createDto.hasProxyClass) {
        createDto.proxyClasses = [];
      }

      const record = await this.monthlyClassCountModel.create(createDto);
      return await record.populate([
        'employeeId',
        'classes.classId',
        'proxyClasses.employeeId',
        'proxyClasses.classId',
      ]);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to create record: ${error}`);
    }
  }

  async findAll() {
    try {
      return await this.monthlyClassCountModel
        .find()
        .populate([
          'employeeId',
          'classes.classId',
          'proxyClasses.employeeId',
          'proxyClasses.classId',
        ])
        .sort({ date: -1 });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch records: ${error}`);
    }
  }

  async findOne(id: string) {
    try {
      const record = await this.monthlyClassCountModel
        .findById(id)
        .populate([
          'employeeId',
          'classes.classId',
          'proxyClasses.employeeId',
          'proxyClasses.classId',
        ]);

      if (!record) {
        throw new NotFoundException('Record not found');
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to fetch record: ${error}`);
    }
  }

  async findByEmployeeAndDate(employeeId: string, date: Date) {
    try {
      const record = await this.monthlyClassCountModel
        .findOne({ employeeId, date })
        .populate([
          'employeeId',
          'classes.classId',
          'proxyClasses.employeeId',
          'proxyClasses.classId',
        ]);

      if (!record) {
        throw new NotFoundException('Record not found');
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to fetch record: ${error}`);
    }
  }

  async update(id: string, updateDto: UpdateMonthlyClassCountDto) {
    try {
      // Validate proxy classes data
      if (
        updateDto.hasProxyClass &&
        (!updateDto.proxyClasses || updateDto.proxyClasses.length === 0)
      ) {
        throw new BadRequestException(
          'Proxy classes are required when hasProxyClass is true',
        );
      }

      if (!updateDto.hasProxyClass) {
        updateDto.proxyClasses = [];
      }

      const record = await this.monthlyClassCountModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .populate([
          'employeeId',
          'classes.classId',
          'proxyClasses.employeeId',
          'proxyClasses.classId',
        ]);

      if (!record) {
        throw new NotFoundException('Record not found');
      }
      return record;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(`Failed to update record: ${error}`);
    }
  }

  async remove(id: string) {
    try {
      const record = await this.monthlyClassCountModel.findByIdAndDelete(id);
      if (!record) {
        throw new NotFoundException('Record not found');
      }
      return { message: 'Record deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to delete record: ${error}`);
    }
  }

  async findCurrentMonthClassCountForClassBasedEmployees(date: Date) {
    const employees = await this.employeeService.findAllClassBasedTeachers();

    // Get the first day of the current month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get the last day of the month
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Get all records for the month
    const monthlyRecords = await this.monthlyClassCountModel
      .find({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .populate([
        'employeeId',
        'classes.classId',
        'proxyClasses.employeeId',
        'proxyClasses.classId',
      ])
      .sort({ date: 1 });

    // Process data for each employee
    const result = employees.map((employee) => {
      // Get all records for this employee (both direct and proxy)
      const employeeRecords = monthlyRecords.filter(
        (record) =>
          record.employeeId._id.toString() === employee._id.toString(),
      );

      // Group records by date
      const classCountDetails = employeeRecords.map((record) => {
        const classCount = {
          '3-8': 0,
          '9-10': 0,
          '11-12': 0,
        };

        // Count regular classes
        record.classes.forEach((classItem) => {
          const classNumber = parseInt(
            (classItem.classId as unknown as IClassPopulated).name,
          );
          if (classNumber >= 3 && classNumber <= 8) {
            classCount['3-8'] += classItem.count;
          } else if (classNumber >= 9 && classNumber <= 10) {
            classCount['9-10'] += classItem.count;
          } else if (classNumber >= 11 && classNumber <= 12) {
            classCount['11-12'] += classItem.count;
          }
        });

        // Count proxy classes for this employee
        record?.proxyClasses?.forEach((proxyRecord) => {
          const classNumber = parseInt(
            (proxyRecord.classId as unknown as IClassPopulated).name,
          );
          if (classNumber >= 3 && classNumber <= 8) {
            classCount['3-8'] += 1;
          } else if (classNumber >= 9 && classNumber <= 10) {
            classCount['9-10'] += 1;
          } else if (classNumber >= 11 && classNumber <= 12) {
            classCount['11-12'] += 1;
          }
        });

        return {
          date: record.date,
          classCount,
        };
      });

      return {
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        classCountDetails,
      };
    });

    return result;
  }
}
