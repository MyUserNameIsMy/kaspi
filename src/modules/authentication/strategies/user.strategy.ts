import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '../authentication.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IAccount } from '../interfaces/user.interface';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private readonly authenticationService: AuthenticationService) {
    super();
  }

  async validate(username: string, password: string): Promise<IAccount> {
    const user = await this.authenticationService.validateUser(
      username,
      password,
    );
    if (!user)
      throw new UnauthorizedException('User Strategy Unauthorized Exception');
    return {
      id: user.id,
      email: user.email,
    };
  }
}
