import { ApiProperty } from '@nestjs/swagger';

export class LoginAccountResDto {
  @ApiProperty()
  access_token: string;
}
