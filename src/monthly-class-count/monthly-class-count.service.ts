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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonthlyClassCountService {
  private employeeService: EmployeeService;
  constructor(
    @InjectModel(MonthlyClassCount.name)
    private monthlyClassCountModel: Model<MonthlyClassCount>,
    private moduleRef: ModuleRef,
    private configService: ConfigService,
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
        'classes.classIds',
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
          'classes.classIds',
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
          'classes.classIds',
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
          'classes.classIds',
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
          'classes.classIds',
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
    const timezone = this.configService.get<string>('timezone');

    // Create date object with timezone
    const currentDate = new Date(
      date.toLocaleString('en-US', { timeZone: timezone }),
    );

    // Get the first day of the current month
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    startOfMonth.setHours(0, 0, 0, 0);

    // Get the last day of the month
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    endOfMonth.setHours(23, 59, 59, 999);

    const employees = await this.employeeService.findAllClassBasedTeachers();

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
        'classes.classIds',
        'proxyClasses.employeeId',
        'proxyClasses.classId',
      ])
      .sort({ date: 1 });

    // Process data for each employee
    const result = employees.map((employee) => {
      // Get all records for this employee (both direct and proxy)
      const employeeRecords = monthlyRecords.filter(
        (record) =>
          record?.employeeId?._id?.toString() === employee?._id?.toString(),
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
          const rangeAdded = {
            '3-8': false,
            '9-10': false,
            '11-12': false,
          };

          classItem.classIds.forEach((classId) => {
            const classNumber = parseInt(
              (classId as unknown as IClassPopulated).name,
            );
            if (classNumber >= 3 && classNumber <= 8 && !rangeAdded['3-8']) {
              classCount['3-8'] += classItem.count;
              rangeAdded['3-8'] = true;
            } else if (
              classNumber >= 9 &&
              classNumber <= 10 &&
              !rangeAdded['9-10']
            ) {
              classCount['9-10'] += classItem.count;
              rangeAdded['9-10'] = true;
            } else if (
              classNumber >= 11 &&
              classNumber <= 12 &&
              !rangeAdded['11-12']
            ) {
              classCount['11-12'] += classItem.count;
              rangeAdded['11-12'] = true;
            }
          });
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

      // Calculate total classes taken this month so far
      const totalClassTakenThisMonthSoFar = {
        '3-8': 0,
        '9-10': 0,
        '11-12': 0,
      };

      // Sum up all classes for each range across all dates
      classCountDetails.forEach((detail) => {
        totalClassTakenThisMonthSoFar['3-8'] += detail.classCount['3-8'];
        totalClassTakenThisMonthSoFar['9-10'] += detail.classCount['9-10'];
        totalClassTakenThisMonthSoFar['11-12'] += detail.classCount['11-12'];
      });

      // Calculate total income for each class range
      const totalIncomeThisMonthSoFar = {
        '3-8': 0,
        '9-10': 0,
        '11-12': 0,
        total: 0,
      };

      // Get payment rates for each class range
      employee.paymentPerClass?.forEach((payment) => {
        payment.classes.forEach((cls) => {
          const classNumber = parseInt(cls.name);
          if (classNumber >= 3 && classNumber <= 8) {
            totalIncomeThisMonthSoFar['3-8'] =
              totalClassTakenThisMonthSoFar['3-8'] * payment.amount;
          } else if (classNumber >= 9 && classNumber <= 10) {
            totalIncomeThisMonthSoFar['9-10'] =
              totalClassTakenThisMonthSoFar['9-10'] * payment.amount;
          } else if (classNumber >= 11 && classNumber <= 12) {
            totalIncomeThisMonthSoFar['11-12'] =
              totalClassTakenThisMonthSoFar['11-12'] * payment.amount;
          }
        });
      });

      // Calculate total income across all ranges
      totalIncomeThisMonthSoFar.total =
        totalIncomeThisMonthSoFar['3-8'] +
        totalIncomeThisMonthSoFar['9-10'] +
        totalIncomeThisMonthSoFar['11-12'];

      return {
        shortName: employee.shortName,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        classCountDetails,
        totalClassTakenThisMonthSoFar,
        totalIncomeThisMonthSoFar,
      };
    });

    return result;
  }
}
