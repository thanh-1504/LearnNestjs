import { Injectable } from '@nestjs/common';
import * as React from 'react';
import { Resend } from 'resend';
import { OTPTemplateEmail } from '../../emails/my-template-otp-email';
import envConfig from '../config';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }
  sendMailWithOtp(payload: { email: string; otpCode: string }) {
    return this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['duongnhatthanhaz09@gmail.com'],
      subject: 'OTP code',
      // html: `${payload.otpCode}`,
      react: (
        <OTPTemplateEmail
          title="My email title"
          validationCode={payload.otpCode}
        />
      ),
    });
  }
}
