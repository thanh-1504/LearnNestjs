import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { TwoFactorAuthService } from './services/2fa.service';
import { EmailService } from './services/email.service';
import { HashingService } from './services/hashing.service';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';

const sharedService = [
  PrismaService,
  HashingService,
  TokenService,
  ApiKeyGuard,
  AccessTokenGuard,
  EmailService,
  TwoFactorAuthService,
];

@Global()
@Module({
  providers: [
    ...sharedService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
  exports: sharedService,
  imports: [JwtModule],
})
export class SharedModule {}
