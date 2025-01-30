import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from '../jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const secretOrKey =
      configService.get<string>('JWT_ACCESS_SECRET') ?? 'default-secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
      passReqToCallback: false,
    } as StrategyOptionsWithoutRequest);
  }

  async validate(payload: JwtPayload): Promise<{ user: Express.User }> {
    const user = await this.userService.findById(payload.uid);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { user };
  }
}
