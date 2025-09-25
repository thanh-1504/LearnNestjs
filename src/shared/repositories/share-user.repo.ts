import { Injectable } from '@nestjs/common';
import { PermissionType } from 'src/permission/permission.model';
import { Role } from 'src/roles/roles.model';
import { UserType } from '../models/share-user.model';
import { PrismaService } from '../services/prisma.service';
export type WhereUniqueUserType =
  | { email: string; [key: string]: any }
  | { id: number; [key: string]: any };
type UserIncludeRolePermissionsType = UserType & {
  role: Role & { permissions: PermissionType[] };
};

@Injectable()
export class ShareUserRepository {
  constructor(private readonly prsimaService: PrismaService) {}
  async findUnique(payload: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prsimaService.user.findUnique({
      where: { ...payload, deletedAt: null },
    });
  }

  async findUniqueIncludeRolePermissions(
    where: WhereUniqueUserType,
  ): Promise<UserIncludeRolePermissionsType | null> {
    return await this.prsimaService.user.findFirst({
      where: { ...where, deletedAt: null },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  async updateProfile(updateProfileDto: Partial<UserType>, userId: number) {
    return await this.prsimaService.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        ...updateProfileDto,
        updatedById: userId,
      },
    });
  }

  updateUser(
    where: WhereUniqueUserType,
    data: Partial<UserType>,
  ): Promise<UserType> {
    return this.prsimaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    }) as any;
  }
}
