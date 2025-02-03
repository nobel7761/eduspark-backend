import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class } from './class.model';
import { CreateClassDto, UpdateClassDto } from './class.dto';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<Class>,
    private subjectService: SubjectService,
  ) {}

  async create(createClassDto: CreateClassDto) {
    try {
      // Check if class already exists
      const existingClass = await this.classModel.findOne({
        name: createClassDto.name,
      });

      if (existingClass) {
        // Check for duplicate subjects
        const newSubjectIds = createClassDto.subjects.map((subject) =>
          subject._id.toString(),
        );
        const existingSubjectIds = existingClass.subjects.map(
          (subject) => subject.name,
        );

        const duplicateSubjects = newSubjectIds.filter((id) =>
          existingSubjectIds.includes(id),
        );

        if (duplicateSubjects.length > 0) {
          throw new BadRequestException(
            'One or more subjects already exist in this class',
          );
        }

        // Validate new subject IDs
        const subjectIds = createClassDto.subjects.map(
          (subject) => new Types.ObjectId(subject._id.toString()),
        );
        for (const subjectId of subjectIds) {
          await this.subjectService.findOne(subjectId.toString());
        }

        // Append new subjects to existing class
        const updatedClass = await this.classModel
          .findByIdAndUpdate(
            existingClass._id,
            {
              $push: { subjects: { $each: subjectIds } },
            },
            { new: true },
          )
          .populate('subjects');

        return updatedClass;
      }

      // Validate all subject IDs
      const subjectIds = createClassDto.subjects.map(
        (subject) => new Types.ObjectId(subject._id.toString()),
      );

      for (const subjectId of subjectIds) {
        await this.subjectService.findOne(subjectId.toString());
      }

      const classData = await this.classModel.create({
        name: createClassDto.name,
        subjects: subjectIds,
      });

      return await classData.populate({
        path: 'subjects',
        model: 'Subject',
        select: '_id name',
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new BadRequestException('One or more subject IDs are invalid');
      }
      throw new BadRequestException(
        `Failed to create class: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.classModel
        .find()
        .populate({
          path: 'subjects',
          model: 'Subject',
          select: '_id name',
        })
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch classes: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const classData = await this.classModel.findById(id).populate({
        path: 'subjects',
        select: '-__v',
      });
      if (!classData) {
        throw new NotFoundException('Class not found');
      }
      return classData;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch class: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    try {
      // Check if new name already exists for another class
      if (updateClassDto.name) {
        const existingClass = await this.classModel.findOne({
          name: updateClassDto.name,
          _id: { $ne: id },
        });

        if (existingClass) {
          throw new BadRequestException('Class with this name already exists');
        }
      }

      // If subjects are being updated, validate all subject IDs
      if (updateClassDto.subjects) {
        const subjectIds = updateClassDto.subjects.map(
          (subject) => subject._id,
        );
        const validatedSubjects = await Promise.all(
          subjectIds.map((id) => this.subjectService.findOne(id.toString())),
        );

        // Convert the subjects to the correct format
        updateClassDto.subjects = validatedSubjects.map((subject) => ({
          _id: subject._id,
        }));
      }

      const classData = await this.classModel
        .findByIdAndUpdate(id, updateClassDto, { new: true })
        .populate('subjects');

      if (!classData) {
        throw new NotFoundException('Class not found');
      }

      return classData;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update class: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const classData = await this.classModel.findByIdAndDelete(id);
      if (!classData) {
        throw new NotFoundException('Class not found');
      }
      return { message: 'Class deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete class: ${error || 'Unknown error occurred'}`,
      );
    }
  }
}
