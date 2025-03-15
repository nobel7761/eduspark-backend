import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from './expense.model';
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto';

interface DateQuery {
  $gte?: Date;
  $lte?: Date;
}

interface ExpenseAggregateResult {
  _id: null;
  totalAmount: number;
}

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto) {
    try {
      const expense = await this.expenseModel.create(createExpenseDto);
      return expense.populate('paidBy');
    } catch (error) {
      throw new BadRequestException(`Failed to create expense: ${error}`);
    }
  }

  async findAll() {
    try {
      return await this.expenseModel
        .find()
        .populate('paidBy')
        .sort({ date: -1 });
    } catch (error) {
      throw new BadRequestException(`Failed to fetch expenses: ${error}`);
    }
  }

  async findOne(id: string) {
    try {
      const expense = await this.expenseModel.findById(id).populate('paidBy');
      if (!expense) {
        throw new NotFoundException('Expense not found');
      }
      return expense;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to fetch expense: ${error}`);
    }
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      const expense = await this.expenseModel
        .findByIdAndUpdate(id, updateExpenseDto, { new: true })
        .populate('paidBy');

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }
      return expense;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update expense: ${error}`);
    }
  }

  async remove(id: string) {
    try {
      const expense = await this.expenseModel.findByIdAndDelete(id);
      if (!expense) {
        throw new NotFoundException('Expense not found');
      }
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to delete expense: ${error}`);
    }
  }

  async findMonthlyExpenses(month: number, year: number) {
    try {
      // Create start and end dates for the specified month using UTC
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      // Find all expenses for the specified month
      const expenses = await this.expenseModel
        .find({
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        })
        .populate('paidBy')
        .sort({ date: 1, createdAt: 1 })
        .lean();

      // Calculate total expenses
      const totalExpense = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      // Group expenses by purpose
      const expensesByType = expenses.reduce(
        (acc, expense) => {
          expense.purpose.forEach((type) => {
            if (!acc[type]) {
              acc[type] = 0;
            }
            acc[type] += expense.amount / expense.purpose.length; // Distribute amount equally among purposes
          });
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        expenses,
        totalExpense,
        expensesByType,
        month: startOfMonth.toLocaleString('default', { month: 'long' }),
        year: year,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch monthly expenses: ${error}`,
      );
    }
  }

  async findExpensesByDateRange(startDate?: string, endDate?: string) {
    const query: { date?: DateQuery } = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    return this.expenseModel
      .find(query)
      .sort({ date: -1 })
      .populate('paidBy')
      .exec();
  }

  async getThisMonthExpenseCount(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const result = await this.expenseModel.aggregate<ExpenseAggregateResult>([
      {
        $match: {
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  }

  async getTotalExpenseCount(): Promise<number> {
    const result = await this.expenseModel.aggregate<ExpenseAggregateResult>([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  }
}
