import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import envConfig from 'src/shared/config';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { IsPublic } from 'src/shared/decorators/auth.decorator';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { ResponseMessageDto } from 'src/shared/dtos/response.dto';
import {
  DisableTwoFactoryBodyDto,
  ForgotPasswordBodyDto,
  LoginBodyDto,
  LoginResponseDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResponseDto,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOtpBodyDto,
  TwoFactorySetupResDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { GoogleService } from './google-service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}
  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body);
  }

  @Post('send-otp')
  @IsPublic()
  @ZodSerializerDto(ResponseMessageDto)
  sendOtp(@Body() sendOtpBodyDto: SendOtpBodyDto) {
    return this.authService.sendOtp(sendOtpBodyDto);
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResponseDto)
  login(
    @Body() loginDto: LoginBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login({
      ...loginDto,
      userAgent,
      ip,
    });
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResponseDto)
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenBodyDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.refreshToken({
      refreshToken: refreshTokenDto.refreshToken,
      userAgent,
      ip,
    });
  }

  @Post('logout')
  @ZodSerializerDto(ResponseMessageDto)
  logout(@Body() logoutDto: LogoutBodyDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }

  @Get('google-link')
  @IsPublic()
  GetGoogleAuthorizationLink(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getGoogleAuthLink({ userAgent, ip });
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.googleService.googleCallBack({ state, code });
      console.log(data);
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data?.accessToken}&refreshToken=${data?.refreshToken}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác';
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}error=${message}`,
      );
    }
  }

  @IsPublic()
  @Post('forgotPassword')
  @ZodSerializerDto(ResponseMessageDto)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordBodyDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorySetupResDto)
  setupTwoFactorAuth(@ActiveUser('userId') userId: number) {
    return this.authService.setupTwoFactorAuth(userId);
  }

  @Post('2fa/disable')
  @ZodSerializerDto(ResponseMessageDto)
  disableTwoFactoryAuth(
    @Body() body: DisableTwoFactoryBodyDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.authService.disableTwoFactoryAuth({
      ...body,
      userId,
    });
  }
}
