import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDocument } from '../users/user.model';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = UserDocument>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    return user as TUser;
  }
}
