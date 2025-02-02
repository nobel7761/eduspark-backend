import { Status } from '../enums/status.enum';
import { UserType } from '../enums/users.enum';

export interface JwtPayload {
  uid: string; // User ID
  userType: UserType;
  status: Status;
  email: string;
  firstName: string;
  lastName: string;
}
