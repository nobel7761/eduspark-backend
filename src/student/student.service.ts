import { Injectable, NotFoundException } from '@nestjs/common';
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
    return await this.studentModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const student = await this.studentModel.findById(id);
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
}
