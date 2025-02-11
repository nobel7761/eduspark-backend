import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher } from './teacher.model';
import { CreateTeacherDto } from './teacher.dto';
import { UpdateTeacherDto } from './teacher.dto';
import { generateTeacherId } from '../utils/generate-teacher-id';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    try {
      // Check for duplicate email
      if (createTeacherDto.email) {
        const existingTeacher = await this.teacherModel.findOne({
          email: createTeacherDto.email.toLowerCase(),
        });
        if (existingTeacher) {
          throw new BadRequestException('Email address already exists');
        }
      }

      // Check for duplicate primary number
      if (createTeacherDto.primaryPhone) {
        const existingTeacher = await this.teacherModel.findOne({
          primaryPhone: createTeacherDto.primaryPhone,
        });
        if (existingTeacher) {
          throw new BadRequestException('Primary phone number already exists');
        }
      }

      // Get total number of teachers
      const totalTeachers = await this.teacherModel.countDocuments();

      // Clean up the DTO by removing empty string values while preserving boolean values
      const cleanedDto = Object.fromEntries(
        Object.entries(createTeacherDto).filter(([, value]) => {
          if (typeof value === 'boolean') return true;
          if (value === '') return false;
          return value !== undefined && value !== null;
        }),
      ) as CreateTeacherDto;

      // Generate teacher ID
      const teacherId = generateTeacherId(
        cleanedDto.firstName,
        cleanedDto.lastName,
        new Date(cleanedDto.joiningDate || new Date()),
        totalTeachers,
      );

      // Create teacher with generated ID and cleaned data
      const teacher = await this.teacherModel.create({
        ...cleanedDto,
        teacherId,
      });

      return teacher;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create teacher: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAll() {
    return await this.teacherModel.find().sort({ createdAt: -1 });
  }

  async findOne(teacherId: string) {
    const teacher = await this.teacherModel.findOne({ teacherId: teacherId });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    try {
      // Check if teacher exists
      const existingTeacher = await this.teacherModel.findById(id);
      if (!existingTeacher) {
        throw new NotFoundException('Teacher not found');
      }

      // Check for duplicate email if being updated
      if (
        updateTeacherDto.email &&
        updateTeacherDto.email !== existingTeacher.email
      ) {
        const teacherWithEmail = await this.teacherModel.findOne({
          email: updateTeacherDto.email.toLowerCase(),
          _id: { $ne: id },
        });
        if (teacherWithEmail) {
          throw new BadRequestException('Email already exists');
        }
      }

      // Check for duplicate phone if being updated
      if (
        updateTeacherDto.primaryPhone &&
        updateTeacherDto.primaryPhone !== existingTeacher.primaryPhone
      ) {
        const teacherWithPhone = await this.teacherModel.findOne({
          $or: [
            { primaryPhone: updateTeacherDto.primaryPhone },
            { secondaryPhone: updateTeacherDto.primaryPhone },
          ],
          _id: { $ne: id },
        });
        if (teacherWithPhone) {
          throw new BadRequestException('Phone number already exists');
        }
      }

      const updatedTeacher = await this.teacherModel.findByIdAndUpdate(
        id,
        updateTeacherDto,
        { new: true },
      );
      return updatedTeacher;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update teacher: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async remove(teacherId: string) {
    const teacher = await this.teacherModel.findOneAndDelete({ teacherId });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return { message: 'Teacher deleted successfully' };
  }

  async bulkDelete(teacherIds: string[]) {
    try {
      // Validate input
      if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
        throw new BadRequestException('Please provide an array of teacher IDs');
      }

      // Keep track of results
      const results = {
        success: [] as string[],
        failed: [] as { id: string; reason: string }[],
        totalProcessed: 0,
        totalSuccess: 0,
        totalFailed: 0,
      };

      // Process each teacher ID
      for (const teacherId of teacherIds) {
        try {
          const teacher = await this.teacherModel.findOneAndDelete({
            teacherId,
          });

          if (!teacher) {
            results.failed.push({
              id: teacherId,
              reason: 'Teacher not found',
            });
          } else {
            results.success.push(teacherId);
          }
        } catch (error: unknown) {
          results.failed.push({
            id: teacherId,
            reason:
              error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }

      // Calculate totals
      results.totalProcessed = teacherIds.length;
      results.totalSuccess = results.success.length;
      results.totalFailed = results.failed.length;

      // If no teachers were deleted successfully, throw an error
      if (results.totalSuccess === 0) {
        throw new BadRequestException({
          message: 'Failed to delete any teachers',
          details: results,
        });
      }

      // Return results
      return {
        message:
          results.totalFailed > 0
            ? `Successfully deleted ${results.totalSuccess} teachers with ${results.totalFailed} failures`
            : `Successfully deleted ${results.totalSuccess} teachers`,
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
}
