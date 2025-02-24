import { Types } from 'mongoose';

export interface IClass {
  name: string;
  subjects: Types.ObjectId[] | string[];
}

export interface IClassWithId extends IClass {
  _id: Types.ObjectId;
}

export interface IClassPopulated {
  _id: Types.ObjectId;
  name: string;
  subjects: {
    _id: Types.ObjectId;
    name: string;
  }[];
}

export interface IClassResponse {
  id: string;
  name: string;
  subjects: {
    id: string;
    name: string;
  }[];
}
