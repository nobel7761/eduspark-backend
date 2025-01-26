import { Status } from 'src/enums/status.enum';
import { UserType } from 'src/enums/users.enum';

export interface JwtPayload {
  uid: string; // User ID
  userType: UserType;
  status: Status;
  email: string;
  firstName: string;
  lastName: string;
}
