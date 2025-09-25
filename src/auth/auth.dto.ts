import { createZodDto } from 'nestjs-zod';
import {
  DisableTwoFactoryBodySchema,
  ForgotPasswordSchema,
  GetAuthorizationUrlResSchema,
  GoogleAuthStateSchema,
  LoginBodyResponseSchema,
  LoginBodySchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOtpBodySchema,
  TwoFactorySetupResSchema,
} from './auth.model';

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class SendOtpBodyDto extends createZodDto(SendOtpBodySchema) {}
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class LoginResponseDto extends createZodDto(LoginBodyResponseSchema) {}
export class LogoutBodyDto extends createZodDto(LogoutBodySchema) {}
export class RefreshTokenBodyDto extends createZodDto(RefreshTokenBodySchema) {}
export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}
export class GoogleAuthStateDto extends createZodDto(GoogleAuthStateSchema) {}
export class GetAuthorizationUrlResDTO extends createZodDto(
  GetAuthorizationUrlResSchema,
) {}
export class ForgotPasswordBodyDto extends createZodDto(ForgotPasswordSchema) {}
export class TwoFactorySetupResDto extends createZodDto(
  TwoFactorySetupResSchema,
) {}
export class DisableTwoFactoryBodyDto extends createZodDto(
  DisableTwoFactoryBodySchema,
) {}
