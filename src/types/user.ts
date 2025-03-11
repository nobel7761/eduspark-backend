import { Status } from '../enums/status.enum';
import { UserType } from '../enums/users.enum';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  current_password?: string;
  phone: string;
  secondaryPhoneNumber?: string;
  status: Status;
  userType: UserType;
  forgotPasswordToken?: string | null;
  accessToken?: string | null;
}
