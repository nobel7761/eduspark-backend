import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './student.model';
import { CreateStudentDto } from './student.dto';
import { generateStudentId } from '../utils/generate-student-id';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    try {
      const totalStudents = await this.studentModel.countDocuments();
      // Generate student ID
      const studentId = generateStudentId(
        totalStudents,
        createStudentDto.class,
      );

      // Create student with generated ID
      const student = await this.studentModel.create({
        ...createStudentDto,
        studentId,
      });

      return student;
    } catch (error) {
      console.error('Student Creation Error:', error);
      throw error;
    }
  }

  async findAll() {
    return await this.studentModel.find().sort({
      studentId: 1, // Sort by studentId in ascending order
    });
  }

  async findOne(studentId: string) {
    const student = await this.studentModel.findOne({ studentId });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async update(studentId: string, updateStudentDto: Partial<CreateStudentDto>) {
    const student = await this.studentModel.findOne({ studentId });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return await this.studentModel.findOneAndUpdate(
      { studentId },
      {
        ...updateStudentDto,
      },
      { new: true },
    );
  }

  async remove(studentId: string) {
    const student = await this.studentModel.findOne({ studentId });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentModel.deleteOne({ studentId });
    return { message: 'Student deleted successfully' };
  }

  async bulkDelete(studentIds: string[]) {
    try {
      // Validate input
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        throw new BadRequestException('Please provide an array of student IDs');
      }

      // Keep track of results
      const results = {
        success: [] as string[],
        failed: [] as { id: string; reason: string }[],
        totalProcessed: 0,
        totalSuccess: 0,
        totalFailed: 0,
      };

      // Process each student ID
      for (const studentId of studentIds) {
        try {
          const student = await this.studentModel.findOneAndDelete({
            studentId,
          });

          if (!student) {
            results.failed.push({
              id: studentId,
              reason: 'Student not found',
            });
          } else {
            results.success.push(studentId);
          }
        } catch (error: unknown) {
          results.failed.push({
            id: studentId,
            reason:
              error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }

      // Calculate totals
      results.totalProcessed = studentIds.length;
      results.totalSuccess = results.success.length;
      results.totalFailed = results.failed.length;

      // If no students were deleted successfully, throw an error
      if (results.totalSuccess === 0) {
        throw new BadRequestException({
          message: 'Failed to delete any students',
          details: results,
        });
      }

      // Return results
      return {
        message:
          results.totalFailed > 0
            ? `Successfully deleted ${results.totalSuccess} students with ${results.totalFailed} failures`
            : `Successfully deleted ${results.totalSuccess} students`,
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
