import { UsersService } from 'src/users/users.service';

export type RequestUserType = Awaited<ReturnType<UsersService['findById']>>;
