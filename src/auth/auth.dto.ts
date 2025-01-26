import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/users/user.model';

export class RegistrationFormData extends PickType(User, [
  'firstName',
  'lastName',
  'email',
  'password',
  'primaryPhoneNumber',
] as const) {}
