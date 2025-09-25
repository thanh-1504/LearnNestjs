import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { HashingService } from './../shared/services/hashing.service';
import { ChangePasswordType, UpdateMeType } from './profile.model';

@Injectable()
export class ProfileService {
  constructor(
    private readonly shareUserRepo: ShareUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  getProfile(userId: number) {
    return this.shareUserRepo.findUniqueIncludeRolePermissions({
      id: userId,
      deletedAt: null,
    });
  }

  updateProfile(updateProfileDto: UpdateMeType, userId: number) {
    return this.shareUserRepo.updateProfile(updateProfileDto, userId);
  }

  async changePassword(changePasswordDto: ChangePasswordType, userId: number) {
    const user = await this.shareUserRepo.findUnique({ id: userId });
    if (!user)
      throw new UnprocessableEntityException([
        {
          message: 'User not found',
        },
      ]);
    const correctPassword = this.hashingService.comparePassword(
      changePasswordDto.password,
      user.password,
    );
    if (!correctPassword)
      throw new UnprocessableEntityException([
        {
          message: 'Incorrect Password',
          path: 'password',
        },
      ]);
    const hashedPassword = await this.hashingService.hashPassword(
      changePasswordDto.newPassword,
    );
    await this.shareUserRepo.updateProfile(
      { password: hashedPassword },
      userId,
    );
    return {
      message: 'Password changed successfully',
    };
  }
}
