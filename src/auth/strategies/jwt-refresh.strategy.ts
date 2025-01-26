import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

interface JwtPayload {
  email: string;
  sub: string;
}

interface ValidatedToken extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: JwtPayload): Promise<ValidatedToken> {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new UnauthorizedException();
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();
    const user = await this.usersService.findByEmail(payload.email);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException();
    }

    return { ...payload, refreshToken };
  }
}
