import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment } from './investment.model';
import { CreateInvestmentDto, UpdateInvestmentDto } from './investment.dto';
import { EmployeeService } from '../employee/employee.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

interface InvestmentAggregation {
  _id: string;
  totalInvestment: number;
  investmentCount: number;
}

interface InvestmentGroup {
  employeeName: string;
  investmentRecords: Array<{ date: Date; amount: number }>;
  totalInvestment: number;
}

interface GroupedInvestments {
  [key: string]: InvestmentGroup;
}

interface PopulatedEmployee {
  _id: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
    private employeeService: EmployeeService,
  ) {}

  async create(createInvestmentDto: CreateInvestmentDto) {
    try {
      // First verify if the employee exists
      await this.employeeService.findByEmployeeDatabaseId(
        createInvestmentDto.employeeId,
      );

      // Create the investment record
      const investment = await this.investmentModel.create(createInvestmentDto);
      return await investment.populate('employeeId');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Employee not found');
      }
      throw new BadRequestException(
        `Failed to create investment record: ${error}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.investmentModel
        .find()
        .populate('employeeId')
        .sort({ date: -1 });
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch investment records: ${error}`,
      );
    }
  }

  async findAllInvestmentReports() {
    try {
      const investments = await this.investmentModel
        .find()
        .populate<{ employeeId: PopulatedEmployee }>('employeeId')
        .lean();

      const groupedInvestments = investments.reduce<GroupedInvestments>(
        (acc, investment) => {
          const employeeId = investment.employeeId._id.toString();
          if (!acc[employeeId]) {
            acc[employeeId] = {
              employeeName: `${investment.employeeId.firstName} ${investment.employeeId.lastName}`,
              investmentRecords: [],
              totalInvestment: 0,
            };
          }

          acc[employeeId].investmentRecords.push({
            date: investment.date,
            amount: investment.amount,
          });
          acc[employeeId].totalInvestment += investment.amount;
          return acc;
        },
        {},
      );

      // Convert to array and sort investment records by date (oldest first)
      return Object.values(groupedInvestments).map((group) => ({
        ...group,
        investmentRecords: group.investmentRecords.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }));
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch investment reports: ${error}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const investment = await this.investmentModel
        .findById(id)
        .populate('employeeId');

      if (!investment) {
        throw new NotFoundException('Investment record not found');
      }
      return investment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to fetch investment record: ${error}`,
      );
    }
  }

  async findByEmployeeAndDate(employeeId: string, date: Date) {
    try {
      const investment = await this.investmentModel
        .findOne({ employeeId, date })
        .populate('employeeId');

      if (!investment) {
        throw new NotFoundException('Investment record not found');
      }
      return investment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to fetch investment record: ${error}`,
      );
    }
  }

  async update(id: string, updateInvestmentDto: UpdateInvestmentDto) {
    try {
      const investment = await this.investmentModel
        .findByIdAndUpdate(id, updateInvestmentDto, { new: true })
        .populate('employeeId');

      if (!investment) {
        throw new NotFoundException('Investment record not found');
      }
      return investment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to update investment record: ${error}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const investment = await this.investmentModel
        .findByIdAndDelete(id)
        .populate('employeeId');

      if (!investment) {
        throw new NotFoundException('Investment record not found');
      }
      return { message: 'Investment record deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Failed to delete investment record: ${error}`,
      );
    }
  }

  async getTotalInvestmentByEmployee(employeeId: string) {
    try {
      await this.employeeService.findOne(employeeId);

      const result =
        await this.investmentModel.aggregate<InvestmentAggregation>([
          { $match: { employeeId: employeeId } },
          {
            $group: {
              _id: '$employeeId',
              totalInvestment: { $sum: '$amount' },
              investmentCount: { $sum: 1 },
            },
          },
        ]);

      return {
        employeeId,
        totalInvestment: result[0]?.totalInvestment || 0,
        investmentCount: result[0]?.investmentCount || 0,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to calculate total investment: ${error}`,
      );
    }
  }
}
