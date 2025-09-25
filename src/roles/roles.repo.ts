import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateRoleType,
  GetRoleQueriesType,
  GetRolesResType,
  Role,
  UpdateRoleType,
} from './roles.model';

@Injectable()
export class RoleRepo {
  constructor(private readonly prismaService: PrismaService) {}
  
  async list({ page, limit }: GetRoleQueriesType): Promise<GetRolesResType> {
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({ where: { deletedAt: null } }),
      this.prismaService.role.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      data,
    };
  }

  async findById(idRole: number) {
    return await this.prismaService.role.findUnique({
      where: { id: idRole, deletedAt: null },
      include: { permissions: { where: { deletedAt: null } } },
    });
  }

  create(createRoleDto: CreateRoleType, userId: number): Promise<Role> {
    return this.prismaService.role.create({
      data: {
        ...createRoleDto,
        createdById: userId,
      },
    });
  }

  async update(updateRoleDto: UpdateRoleType, idRole: number, userId: number) {
    if (updateRoleDto.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: { id: { in: updateRoleDto.permissionIds } },
      });
      const deletedPermissions = permissions.filter((item) => item.deletedAt);
      if (deletedPermissions.length > 0) {
        const deletedIds = deletedPermissions.map((item) => item.id).join(',');
        throw new Error(`Permissions with id has been deleted: ${deletedIds}`);
      }
    }
    return this.prismaService.role.update({
      where: { id: idRole, deletedAt: null },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        isActive: updateRoleDto.isActive,
        permissions: {
          set: updateRoleDto.permissionIds.map((id) => ({
            id,
          })),
        },
        updatedById: userId,
      },
      include: { permissions: { where: { deletedAt: null } } },
    });
  }

  delete(idRole: number, userId: number, isHard?: boolean): Promise<Role> {
    
    return isHard
      ? this.prismaService.role.delete({
          where: { id: idRole },
        })
      : this.prismaService.role.update({
          where: { id: idRole, deletedAt: null },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        });
  }
}
