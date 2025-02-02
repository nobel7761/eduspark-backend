import { PickType } from '@nestjs/mapped-types';
import { User } from '../users/user.model';

export class RegistrationFormData extends PickType(User, [
  'firstName',
  'lastName',
  'email',
  'password',
  'primaryPhoneNumber',
] as const) {}

export type LoginForm = Pick<User, 'email' | 'password'>;
