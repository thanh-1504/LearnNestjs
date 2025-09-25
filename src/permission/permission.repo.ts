import { Injectable } from '@nestjs/common';
import { PrismaService } from './../shared/services/prisma.service';
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import {
  GetPermissionParamsType,
  GetPermissionQueryType,
  GetPermissionResType,
  PermissionType,
} from './permission.model';

@Injectable()
export class PermissionRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async getList({
    page,
    limit,
  }: GetPermissionQueryType): Promise<GetPermissionResType> {
    const skip = (+page - 1) * +limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({ where: { deletedAt: null } }),
      this.prismaService.permission.findMany({
        where: { deletedAt: null },
        skip,
        take: +limit,
      }),
    ]);
    return {
      page: +page,
      limit: +limit,
      totalItems,
      totalPages: Math.ceil(totalItems / +limit),
      data,
    };
  }

  findById(params: GetPermissionParamsType): Promise<PermissionType | null> {
    return this.prismaService.permission.findUnique({
      where: { id: +params.permissionId, deletedAt: null },
    });
  }

  create(
    createPermissionDto: CreatePermissionDto,
    userId: number,
  ): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: { ...createPermissionDto, createdById: userId },
    });
  }

  update(
    updatePermissionDto: UpdatePermissionDto,
    params: GetPermissionParamsType,
    userId: number,
  ): Promise<PermissionType> {
    return this.prismaService.permission.update({
      where: { id: params.permissionId, deletedAt: null },
      data: {
        ...updatePermissionDto,
        updatedById: userId,
      },
    });
  }

  delete(
    permissionId: number,
    userId: number,
    isHard?: boolean,
  ): Promise<PermissionType> {
    return isHard
      ? this.prismaService.permission.delete({
          where: { id: permissionId },
        })
      : this.prismaService.permission.update({
          where: { id: permissionId, deletedAt: null },
          data: { deletedAt: new Date(), deletedById: userId },
        });
  }
}
