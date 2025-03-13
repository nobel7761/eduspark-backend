import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import configuration from './config/configuration';
import { StudentModule } from './student/student.module';
import { DirectorsModule } from './directors/directors.module';
import { ManagementRegularTimingModule } from './management-regular-timing/management-regular-timing.module';
import { SubjectModule } from './subject/subject.module';
import { ClassModule } from './class/class.module';
import { EmployeeModule } from './employee/employee.module';
import { MonthlyClassCountModule } from './monthly-class-count/monthly-class-count.module';
import { InvestmentModule } from './investment/investment.module';
import { EarningModule } from './earning/earning.module';
import { ExpenseModule } from './expense/expense.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    UsersModule,
    AttendanceModule,
    StudentModule,
    DirectorsModule,
    ManagementRegularTimingModule,
    SubjectModule,
    ClassModule,
    EmployeeModule,
    MonthlyClassCountModule,
    InvestmentModule,
    EarningModule,
    ExpenseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
