import { Module } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth-repository';
import { SharedRoleService } from 'src/shared/repositories/share-role.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { UsersController } from './users.controller';
import { UserRepo } from './users.repo';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepo,
    AuthRepository,
    SharedRoleService,
    ShareUserRepository,
  ],
})
export class UsersModule {}
