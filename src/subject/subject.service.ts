import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject } from './subject.model';
import { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
  ) {}

  async findAll() {
    try {
      return await this.subjectModel.find().sort({ name: 1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch subjects: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const subject = await this.subjectModel.findById(id);
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      return subject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch subject: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    try {
      // Check if new name already exists for another subject
      if (updateSubjectDto.name) {
        const existingSubject = await this.subjectModel.findOne({
          name: updateSubjectDto.name,
          _id: { $ne: id },
        });

        if (existingSubject) {
          throw new BadRequestException(
            'Subject with this name already exists',
          );
        }
      }

      const subject = await this.subjectModel.findByIdAndUpdate(
        id,
        updateSubjectDto,
        { new: true },
      );

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      return subject;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update subject: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const subject = await this.subjectModel.findByIdAndDelete(id);
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      return { message: 'Subject deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete subject: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async create(subjects: CreateSubjectDto[]) {
    try {
      // Validate input array
      if (!Array.isArray(subjects) || subjects.length === 0) {
        throw new BadRequestException(
          'Invalid input: Expected non-empty array of subjects',
        );
      }

      // Extract all subject names to check
      const subjectNames = subjects.map((subject) => subject.name);

      // Check for duplicates within the input array itself
      const uniqueNames = new Set(subjectNames);
      if (uniqueNames.size !== subjectNames.length) {
        throw new BadRequestException(
          'Duplicate subjects found in the input array',
        );
      }

      // Check if any subjects already exist in database
      const existingSubjects = await this.subjectModel.find({
        name: { $in: subjectNames },
      });

      if (existingSubjects.length > 0) {
        const existingNames = existingSubjects
          .map((subject) => subject.name)
          .join(', ');
        throw new BadRequestException(
          `Cannot create subjects. Following subjects already exist: ${existingNames}`,
        );
      }

      // If no existing subjects found, create all new subjects
      const createdSubjects = await this.subjectModel.insertMany(subjects, {
        ordered: true, // Changed to true to ensure atomic operation
      });

      return createdSubjects;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create subjects: ${error || 'Unknown error occurred'}`,
      );
    }
  }
}
