import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserStrategy } from './strategies/user.strategy';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [AuthenticationController],
  providers: [UserStrategy, JwtUserStrategy, AuthenticationService],
})
export class AuthenticationModule {}
