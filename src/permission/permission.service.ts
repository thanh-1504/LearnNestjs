import { Injectable } from '@nestjs/common';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import {
  GetPermissionParamsType,
  GetPermissionQueryType,
} from './permission.model';
import { PermissionRepo } from './permission.repo';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}
  getList({ page, limit }: GetPermissionQueryType) {
    return this.permissionRepo.getList({ page, limit });
  }

  findById(params: GetPermissionParamsType) {
    return this.permissionRepo.findById(params);
  }

  create(createPermissionDto: CreatePermissionDto, userId: number) {
    return this.permissionRepo.create(createPermissionDto, userId);
  }

  update(
    updatePermissionDto: UpdatePermissionDto,
    params: GetPermissionParamsType,
    userId: number,
  ) {
    return this.permissionRepo.update(updatePermissionDto, params, userId);
  }

  async delete(permissionId: number, userId: number) {
    await this.permissionRepo.delete(permissionId, userId);
    return {
      message: 'Delete successfully',
    };
  }
}
