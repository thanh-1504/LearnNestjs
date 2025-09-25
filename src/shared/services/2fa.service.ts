import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';

@Injectable()
export class TwoFactorAuthService {
  private createOtp(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: 'NestJS Super Ecommerce',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateTOTPSecret(email: string) {
    const totp = this.createOtp(email);
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    };
  }

  verifyTOTP({
    email,
    secret,
    token,
  }: {
    email: string;
    secret: string;
    token: string;
  }): boolean {
    const totp = this.createOtp(email, secret);
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }
}
