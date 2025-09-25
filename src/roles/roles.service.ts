import { ForbiddenException, Injectable } from '@nestjs/common';
import { RoleName } from 'src/shared/constrants/role-constrant';
import {
  CreateRoleType,
  GetRoleQueriesType,
  UpdateRoleType,
} from './roles.model';
import { RoleRepo } from './roles.repo';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepo: RoleRepo) {}

  private async verifyRole(roleId: number) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new Error('Role not found !');
    const basedRoles: string[] = [
      RoleName.Admin,
      RoleName.Client,
      RoleName.Seller,
    ];
    if (basedRoles.includes(role.name)) throw new ForbiddenException();
  }

  list({ page, limit }: GetRoleQueriesType) {
    return this.roleRepo.list({ page, limit });
  }

  findById(idRole: number) {
    return this.roleRepo.findById(idRole);
  }

  create(createRoleDto: CreateRoleType, userId: number) {
    return this.roleRepo.create(createRoleDto, userId);
  }

  async update(updateRoleDto: UpdateRoleType, idRole: number, userId: number) {
    await this.verifyRole(idRole);
    return this.roleRepo.update(updateRoleDto, idRole, userId);
  }

  async delete(idRole: number, userId: number) {
    await this.verifyRole(idRole);
    await this.roleRepo.delete(idRole, userId);
    return {
      message: 'Delete successfully',
    };
  }
}
