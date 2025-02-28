import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
  StrategyOptionWithRequest,
} from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

interface FacebookUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  facebookId: string;
}

interface FacebookProfile extends Profile {
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  name: {
    givenName: string;
    familyName: string;
  };
  id: string;
  _json: {
    id: string;
  };
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const config: StrategyOptionWithRequest = {
      clientID: configService.get<string>('oauth.facebook.appId') ?? '',
      clientSecret: configService.get<string>('oauth.facebook.appSecret') ?? '',
      callbackURL:
        configService.get<string>('oauth.facebook.callbackUrl') ?? '',
      scope: ['email', 'public_profile'],
      profileFields: ['emails', 'name', 'photos'],
      passReqToCallback: false,
    };
    super(config);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: (error: Error | null, user: FacebookUser | null) => void,
  ): void {
    try {
      const user: FacebookUser = {
        email: profile.emails?.[0]?.value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        picture: profile.photos?.[0]?.value,
        facebookId: profile.id,
      };
      done(null, user);
    } catch (error) {
      done(
        error instanceof Error
          ? error
          : new Error('Facebook validation failed'),
        null,
      );
    }
  }
}
