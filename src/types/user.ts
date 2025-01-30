import { Status } from '../enums/status.enum';
import { UserType } from '../enums/users.enum';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  current_password?: string;
  primaryPhoneNumber: string;
  secondaryPhoneNumber?: string;
  status: Status;
  userType: UserType;
  forgotPasswordToken?: string | null;
  accessToken?: string | null;
}
