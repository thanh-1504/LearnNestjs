import { Injectable } from '@nestjs/common';
import { Role } from 'src/roles/roles.model';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RoleName } from '../constrants/role-constrant';

@Injectable()
export class SharedRoleService {
  private clientRoleId: number | null = null;
  private adminRoleId: number | null = null;
  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string): Promise<Role> {
    const role: Role = await this.prismaService
      .$queryRaw`SELECT * from "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL LIMIT 1`.then(
      (res: Role[]) => {
        if (res.length === 0) throw new Error('Role not found');
        return res[0];
      },
    );
    return role;
  }

  async getClientRoleId() {
    if (this.clientRoleId) return this.clientRoleId;
    const role = await this.getRole(RoleName.Client);
    this.clientRoleId = role.id;
    return this.clientRoleId;
  }

  async getAdminRoleId() {
    if (this.adminRoleId) return this.adminRoleId;
    const role = await this.getRole(RoleName.Admin);
    this.adminRoleId = role.id;
    return this.adminRoleId;
  }
}
