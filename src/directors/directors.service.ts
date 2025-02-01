import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Director } from './director.model';
import { CreateDirectorDto } from './director.dto';
import { UpdateDirectorDto } from './director.dto';

@Injectable()
export class DirectorsService {
  constructor(
    @InjectModel(Director.name) private directorModel: Model<Director>,
  ) {}

  async create(createDirectorDto: CreateDirectorDto) {
    try {
      // Check for duplicate email and phone numbers
      const existingDirector = await this.directorModel.findOne({
        $or: [
          { email: createDirectorDto.email.toLowerCase() },
          { primaryPhone: createDirectorDto.primaryPhone },
          ...(createDirectorDto.secondaryPhone
            ? [{ secondaryPhone: createDirectorDto.secondaryPhone }]
            : []),
        ],
      });

      if (existingDirector) {
        let duplicateField = '';
        if (existingDirector.email === createDirectorDto.email.toLowerCase()) {
          duplicateField = 'email';
        } else if (
          existingDirector.primaryPhone === createDirectorDto.primaryPhone
        ) {
          duplicateField = 'primary phone';
        } else {
          duplicateField = 'secondary phone';
        }
        throw new BadRequestException(
          `Director with this ${duplicateField} already exists`,
        );
      }

      // Calculate total percentage
      const existingDirectors = await this.directorModel.find();
      const currentTotalPercentage = existingDirectors.reduce(
        (sum, director) => sum + (director.sharePercentage || 0),
        0,
      );

      const newTotalPercentage =
        currentTotalPercentage + createDirectorDto.sharePercentage;

      if (newTotalPercentage > 100) {
        throw new BadRequestException(
          `Cannot create director. Total share percentage would exceed 100%. ` +
            `Current total: ${currentTotalPercentage}%, Attempting to add: ${createDirectorDto.sharePercentage}%`,
        );
      }

      // Create the director
      const director = await this.directorModel.create({
        ...createDirectorDto,
        email: createDirectorDto.email.toLowerCase(),
      });

      return director;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create director: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async findAll() {
    return await this.directorModel.find();
  }

  async findOneByEmail(email: string) {
    const director = await this.directorModel.findOne({
      email: email.toLowerCase(),
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }
    return director;
  }

  async update(email: string, updateDirectorDto: UpdateDirectorDto) {
    try {
      // Find the current director first
      const currentDirector = await this.directorModel.findOne({
        email: email.toLowerCase(),
      });
      if (!currentDirector) {
        throw new NotFoundException('Director not found');
      }

      // If share percentage is being updated, validate the total
      if (updateDirectorDto.sharePercentage !== undefined) {
        const allDirectors = await this.directorModel.find({
          email: { $ne: email.toLowerCase() }, // exclude current director
        });

        const otherDirectorsTotal = allDirectors.reduce(
          (sum, director) => sum + (director.sharePercentage || 0),
          0,
        );

        const newTotalPercentage =
          otherDirectorsTotal + updateDirectorDto.sharePercentage;

        if (newTotalPercentage > 100) {
          throw new BadRequestException(
            `Cannot update director. Total share percentage would exceed 100%. ` +
              `Current total (excluding this director): ${otherDirectorsTotal}%, ` +
              `Attempting to set: ${updateDirectorDto.sharePercentage}%`,
          );
        }
      }

      // Perform the update
      const director = await this.directorModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        updateDirectorDto,
        { new: true },
      );

      return director;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update director: ${error || 'Unknown error occurred'}`,
      );
    }
  }

  async remove(email: string) {
    const director = await this.directorModel.findOneAndDelete({
      email: email.toLowerCase(),
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }
    return { message: 'Director deleted successfully' };
  }
}
