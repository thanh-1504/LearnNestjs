import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RoleRepo } from './roles.repo';
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepo],
})
export class RolesModule {}
