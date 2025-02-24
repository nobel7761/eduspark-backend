import { Types } from 'mongoose';

interface BaseClass {
  employeeId: Types.ObjectId;
  classId: Types.ObjectId;
}

export interface RegularClass extends BaseClass {
  count: number;
}

export interface ProxyClass extends BaseClass {
  numberOfClasses: number;
}

export interface ClassCount {
  employeeId: Types.ObjectId;
  classId: Types.ObjectId;
  totalCount: number;
}
