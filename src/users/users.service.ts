import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth-repository';
import { RoleName } from 'src/shared/constrants/role-constrant';
import { NotFoundRecordException } from 'src/shared/errors';
import { isUniqueConstraintPrismaError } from 'src/shared/helpers/helper';
import { SharedRoleService } from 'src/shared/repositories/share-role.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import {
  CannotUpdateOrDeleteYourselfException,
  UserAlreadyExistsException,
} from './user.errors';
import {
  CreateUserType,
  GetListUsersQueriesType,
  UpdateUserType,
} from './users.model';
import { UserRepo } from './users.repo';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UserRepo,
    private readonly authRepo: AuthRepository,
    private readonly shareUserRepo: ShareUserRepository,
    private readonly sharedRoleRepository: SharedRoleService,
    private readonly hashingService: HashingService,
  ) {}

  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    if (roleNameAgent === RoleName.Admin) return true;
    else {
      const idRoleAdmin = await this.sharedRoleRepository.getAdminRoleId();
      if (idRoleAdmin !== roleIdTarget) throw new ForbiddenException();
    }
    return true;
  }

  private async verifyYourSelf({
    userAgentId,
    userTargetId,
  }: {
    userAgentId: number;
    userTargetId: number;
  }) {
    if (userAgentId === userTargetId)
      throw CannotUpdateOrDeleteYourselfException;
  }

  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.authRepo.findUniqueUserIncludeRole({
      id: userId,
      deletedAt: null,
    });
    if (!currentUser)
      throw new UnprocessableEntityException([
        { message: 'User not found', path: 'userId' },
      ]);
    return currentUser.role.id;
  }

  async getListUsers(getListUsersQueries: GetListUsersQueriesType) {
    return await this.usersRepo.getListUsers(getListUsersQueries);
  }

  async getUser(userId: number) {
    const user = await this.shareUserRepo.findUniqueIncludeRolePermissions({
      id: userId,
      deletedAt: null,
    });
    if (!user) throw NotFoundRecordException;
    return user;
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserType;
    createdById: number;
    createdByRoleName: string;
  }) {
    try {
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      });
      const user = await this.usersRepo.create({
        data: {
          ...data,
          password: await this.hashingService.hashPassword(data.password),
        },
        createdById,
      });
      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error))
        throw UserAlreadyExistsException;
    }
  }

  async update({
    data,
    id,
    updatedById,
    updatedByRoleName,
  }: {
    data: UpdateUserType;
    id: number;
    updatedById: number;
    updatedByRoleName: string;
  }) {
    try {
      await this.verifyYourSelf({ userAgentId: updatedById, userTargetId: id });
      const roleIdTarget = await this.getRoleIdByUserId(id);
      await this.verifyRole({ roleNameAgent: updatedByRoleName, roleIdTarget });
      return await this.shareUserRepo.updateUser(
        { id },
        { ...data, updatedById },
      );
    } catch (error) {}
  }

  async delete({
    id,
    deletedById,
    deletedByRoleName,
  }: {
    id: number;
    deletedById: number;
    deletedByRoleName: string;
  }) {
    try {
      await this.verifyYourSelf({ userAgentId: deletedById, userTargetId: id });
      const roleIdTarget = await this.getRoleIdByUserId(id);
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      });

      await this.usersRepo.delete({
        id,
        deletedById,
      });
      return {
        message: 'Delete successfully',
      };
    } catch (error) {}
  }
}
