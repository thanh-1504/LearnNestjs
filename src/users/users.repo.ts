import { Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth-repository';
import { SharedRoleService } from 'src/shared/repositories/share-role.repo';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateUserType,
  GetListUsersQueriesType,
  GetListUsersResType,
} from './users.model';

@Injectable()
export class UserRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authRepo: AuthRepository,
    private readonly sharedRoleService: SharedRoleService,
  ) {}

  async getListUsers(
    getListUsersQueries: GetListUsersQueriesType,
  ): Promise<GetListUsersResType> {
    const skip = (getListUsersQueries.page - 1) * getListUsersQueries.limit;
    const take = getListUsersQueries.limit;
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        include: {
          role: true,
        },
      }),
    ]);
    return {
      data,
      totalItems,
      page: getListUsersQueries.page,
      limit: getListUsersQueries.limit,
      totalPages: Math.ceil(totalItems / getListUsersQueries.limit),
    };
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateUserType;
    createdById: number;
  }): Promise<CreateUserType> {
    return this.prismaService.user.create({
      data: { ...data, createdById: createdById },
    });
  }

  async delete(
    {
      id,
      deletedById,
    }: {
      id: number;
      deletedById: number;
    },
    isHard?: boolean,
  ) {
    return isHard
      ? await this.prismaService.user.delete({
          where: { id: id, deletedAt: null },
        })
      : await this.prismaService.user.update({
          where: { id: id, deletedAt: null },
          data: {
            deletedAt: new Date(),
          },
        });
  }
}
