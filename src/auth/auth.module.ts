import { Module } from '@nestjs/common';
import { SharedRoleService } from 'src/shared/repositories/share-role.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { AuthRepository } from './auth-repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleService } from './google-service';

@Module({
  providers: [
    AuthService,
    SharedRoleService,
    AuthRepository,
    ShareUserRepository,
    GoogleService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
