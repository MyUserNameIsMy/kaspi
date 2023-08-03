import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { RegisterUserReqDto } from './dto/register.request.dto';
import { IAccount } from './interfaces/user.interface';
import { LoginAccountResDto } from './dto/login.response.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {}
  async validateUser(username: string, password: string): Promise<UserEntity> {
    const user = await UserEntity.findOne({
      select: ['id', 'email', 'password_hash'],
      where: { email: username },
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('No such User or Incorrect password');
    }

    return user;
  }

  async registerUser(registerDto: RegisterUserReqDto): Promise<UserEntity> {
    if (registerDto.confirm !== registerDto.password)
      throw new BadRequestException('Passwords do not match.');

    const user = new UserEntity();
    user.email = registerDto.email;
    user.password_hash = registerDto.password;

    try {
      await user.save();
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return user;
  }

  async generateTokenUser(user: IAccount): Promise<LoginAccountResDto> {
    return {
      access_token: this.jwtService.sign({
        id: user.id,
        email: user.email,
      }),
    };
  }
}
