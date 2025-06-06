import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';
import { Employee, EmployeeDocument } from './employee.model';
import { generateEmployeeId } from '../utils/generate-employee-id';
import { EmployeeType, Role } from '../enums/common.enum';
import { PaymentMethod } from '../enums/payment.enum';
import { UserDocument } from 'src/users/user.model';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      // Check for duplicate email
      if (createEmployeeDto.email) {
        const existingEmployee = await this.employeeModel.findOne({
          email: createEmployeeDto.email.toLowerCase(),
        });
        if (existingEmployee) {
          throw new BadRequestException('Email address already exists');
        }
      }

      // Check for duplicate primary number
      if (createEmployeeDto.primaryPhone) {
        const existingEmployee = await this.employeeModel.findOne({
          primaryPhone: createEmployeeDto.primaryPhone,
        });
        if (existingEmployee) {
          throw new BadRequestException('Primary phone number already exists');
        }
      }

      // Clean up the DTO by removing empty fields
      const cleanedDto = Object.fromEntries(
        Object.entries(createEmployeeDto).filter(([, value]) => {
          if (typeof value === 'boolean') return true;
          if (value === '') return false;
          return value !== undefined && value !== null;
        }),
      ) as CreateEmployeeDto;

      // Only include parent and educational info for teachers
      if (cleanedDto.employeeType !== EmployeeType.TEACHER) {
        delete cleanedDto.father;
        delete cleanedDto.mother;
        delete cleanedDto.educationalBackground;
      }

      // Get total number of employees
      const totalEmployees = await this.employeeModel.countDocuments();

      // Generate employee ID
      const employeeId = generateEmployeeId(
        cleanedDto.firstName,
        cleanedDto.lastName,
        new Date(cleanedDto.joiningDate || new Date()),
        totalEmployees,
      );

      // Create employee with generated ID and cleaned data
      const employee = await this.employeeModel.create({
        ...cleanedDto,
        employeeId,
      });

      return employee;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create employee: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAll() {
    return await this.employeeModel.find().sort({ createdAt: -1 });
  }

  async getEmployeeForSubmitClassCount(user: UserDocument) {
    let employee: EmployeeDocument[] | EmployeeDocument | null = null;
    if (user.role === Role.SUPER_ADMIN) {
      console.log('super admin');
      employee = await this.employeeModel
        .find({
          employeeType: EmployeeType.TEACHER,
          paymentMethod: PaymentMethod.PerClass,
        })
        .sort({ createdAt: -1 });
    } else {
      console.log('not super admin', user.email, user.role);
      const foundEmployee = await this.employeeModel.findOne({
        email: user.email,
      });
      const teacherWhoIsNotDirector = await this.employeeModel.findOne({
        employeeType: EmployeeType.TEACHER,
        paymentMethod: PaymentMethod.PerClass,
        isDirector: false,
      });
      if (!foundEmployee) {
        throw new NotFoundException(
          `Employee with email ${user.email} not found`,
        );
      }
      employee = [
        foundEmployee,
        ...(teacherWhoIsNotDirector ? [teacherWhoIsNotDirector] : []),
      ];
    }
    return employee;
  }

  async findOne(employeeId: string) {
    const employee = await this.employeeModel.findOne({
      employeeId: employeeId,
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }
    return employee;
  }

  async findEmployeeByEmail(email: string) {
    const employee = await this.employeeModel.findOne({
      email: email.toLowerCase(),
    });
    if (!employee) {
      throw new NotFoundException(`Employee with email ${email} not found`);
    }

    return employee;
  }

  async findByEmployeeDatabaseId(employeeId: string) {
    const employee = await this.employeeModel.findById(employeeId);

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return employee;
  }

  async update(employeeId: string, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      // Check if employee exists
      const existingEmployee = await this.employeeModel.findOne({
        employeeId,
      });
      if (!existingEmployee) {
        throw new NotFoundException('Employee not found');
      }

      // Check for duplicate email if being updated
      if (
        updateEmployeeDto.email &&
        updateEmployeeDto.email !== existingEmployee.email
      ) {
        const employeeWithEmail = await this.employeeModel.findOne({
          email: updateEmployeeDto.email.toLowerCase(),
          _id: { $ne: existingEmployee._id },
        });
        if (employeeWithEmail) {
          throw new BadRequestException('Email already exists');
        }
      }

      // Check for duplicate phone if being updated
      if (
        updateEmployeeDto.primaryPhone &&
        updateEmployeeDto.primaryPhone !== existingEmployee.primaryPhone
      ) {
        const employeeWithPhone = await this.employeeModel.findOne({
          $or: [
            { primaryPhone: updateEmployeeDto.primaryPhone },
            { secondaryPhone: updateEmployeeDto.primaryPhone },
          ],
          _id: { $ne: existingEmployee._id },
        });
        if (employeeWithPhone) {
          throw new BadRequestException('Phone number already exists');
        }
      }

      // Clean up the update DTO
      const cleanedDto = Object.fromEntries(
        Object.entries(updateEmployeeDto).filter(([value]) => {
          if (typeof value === 'boolean') return true;
          if (value === '') return false;
          return value !== undefined && value !== null;
        }),
      );

      const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
        existingEmployee._id,
        { $set: cleanedDto },
        { new: true, runValidators: true },
      );
      return updatedEmployee;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update employee: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async remove(employeeId: string) {
    const employee = await this.employeeModel.findOneAndDelete({ employeeId });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return { message: 'Employee deleted successfully' };
  }

  async bulkDelete(employeeIds: string[]) {
    try {
      // Validate input
      if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        throw new BadRequestException(
          'Please provide an array of employee IDs',
        );
      }

      // Keep track of results
      const results = {
        success: [] as string[],
        failed: [] as { id: string; reason: string }[],
        totalProcessed: 0,
        totalSuccess: 0,
        totalFailed: 0,
      };

      // Process each employee ID
      for (const employeeId of employeeIds) {
        try {
          const employee = await this.employeeModel.findOneAndDelete({
            employeeId,
          });

          if (!employee) {
            results.failed.push({
              id: employeeId,
              reason: 'Employee not found',
            });
          } else {
            results.success.push(employeeId);
          }
        } catch (error: unknown) {
          results.failed.push({
            id: employeeId,
            reason:
              error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }

      // Calculate totals
      results.totalProcessed = employeeIds.length;
      results.totalSuccess = results.success.length;
      results.totalFailed = results.failed.length;

      // If no employees were deleted successfully, throw an error
      if (results.totalSuccess === 0) {
        throw new BadRequestException({
          message: 'Failed to delete any employees',
          details: results,
        });
      }

      // Return results
      return {
        message:
          results.totalFailed > 0
            ? `Successfully deleted ${results.totalSuccess} employees with ${results.totalFailed} failures`
            : `Successfully deleted ${results.totalSuccess} employees`,
        details: results,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to process bulk delete: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAllTeachers() {
    try {
      return await this.employeeModel
        .find({ employeeType: EmployeeType.TEACHER })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch teachers: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAllClassBasedTeachers() {
    try {
      return await this.employeeModel
        .find({
          employeeType: EmployeeType.TEACHER,
          paymentMethod: PaymentMethod.PerClass,
        })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch class-based teachers: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAllEmployeesWithoutDirector() {
    try {
      return await this.employeeModel
        .find({ isDirector: { $ne: true } })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch non-director employees: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAllDirectors() {
    try {
      return await this.employeeModel
        .find({ isDirector: true })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch directors: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async getTeachersCount(): Promise<number> {
    return await this.employeeModel.countDocuments({
      employeeType: EmployeeType.TEACHER,
    });
  }
}
