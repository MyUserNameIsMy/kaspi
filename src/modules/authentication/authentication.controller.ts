import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginAccountReqDto } from './dto/login.request.dto';
import { LoginAccountResDto } from './dto/login.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUserReqDto } from './dto/register.request.dto';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register/user')
  @ApiOkResponse({ type: LoginAccountResDto })
  async registerGlobalAdmin(
    @Body() registerDto: RegisterUserReqDto,
  ): Promise<LoginAccountResDto> {
    const user = await this.authenticationService.registerUser(registerDto);
    return await this.authenticationService.generateTokenUser(user);
  }

  @UseGuards(AuthGuard('user'))
  @ApiOkResponse({ type: LoginAccountResDto })
  @Post('login/user')
  async loginUser(
    @Request() req,
    @Body() loginDto: LoginAccountReqDto,
  ): Promise<LoginAccountResDto> {
    return await this.authenticationService.generateTokenUser(req.user);
  }

  @UseGuards(AuthGuard('jwt-user'))
  @ApiOkResponse({ type: LoginAccountResDto })
  @ApiBearerAuth()
  @Post('refresh-token/user')
  async refreshTokenUser(@Request() req): Promise<LoginAccountResDto> {
    return await this.authenticationService.generateTokenUser(req.user);
  }
}
