import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX, MESSAGES } from '../../../common/utils/password.utils';

export class LoginAccountReqDto {
  @ApiProperty({ description: 'Email' })
  @IsEmail()
  username: string;

  @ApiProperty({
    description:
      'Valid Password. Password should have 1 upper case, lowercase letter along with a number and special character. Length 8-24.',
  })
  @IsNotEmpty()
  @Length(8, 24)
  @Matches(REGEX.PASSWORD_RULE, { message: MESSAGES.PASSWORD_RULE_MESSAGE })
  password: string;
}
