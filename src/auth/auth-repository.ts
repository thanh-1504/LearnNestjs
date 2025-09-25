import { Injectable } from '@nestjs/common';
import { RefreshToken, Role, User, VerificationCode } from '@prisma/client';
import { TypeOfVerification } from 'src/shared/constrants/auth-contrants';
import { UserType } from 'src/shared/models/share-user.model';
import { WhereUniqueUserType } from 'src/shared/repositories/share-user.repo';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  DeviceBodyType,
  RefreshTokenType,
  RegisterBodyType,
} from './auth.model';
@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
  ) {
    return await this.prismaService.user.create({ data: user });
  }

  async createUserIncludeRole(
    user: Pick<
      UserType,
      'email' | 'name' | 'password' | 'avatar' | 'phoneNumber' | 'roleId'
    >,
  ): Promise<UserType & { role: Role }> {
    return await this.prismaService.user.create({
      data: user,
      include: { role: true },
    });
  }

  async createVerificationCode(
    payload: Pick<VerificationCode, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCode> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: payload.email,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findUniqueVerificationCode(
    payload:
      | { id: number }
      | {
          email_type: {
            email: string;
            type: TypeOfVerification;
          };
        },
  ): Promise<VerificationCode | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: payload,
    });
  }

  createRefreshToken(payload: {
    token: string;
    userId: number;
    expiresAt: Date;
    deviceId: number;
  }) {
    return this.prismaService.refreshToken.create({
      data: payload,
    });
  }

  createDevice(
    data: Pick<DeviceBodyType, 'userId' | 'userAgent' | 'ip'> &
      Partial<Pick<DeviceBodyType, 'lastActive' | 'isActive'>>,
  ) {
    return this.prismaService.device.create({ data });
  }

  async findUniqueUserIncludeRole(
    payload: WhereUniqueUserType,
  ): Promise<(User & { role: Role }) | null> {
    return await this.prismaService.user.findUnique({
      where: payload,
      include: { role: true },
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(payload: {
    token: string;
  }): Promise<(RefreshToken & { user: User & { role: Role } }) | null> {
    return await this.prismaService.refreshToken.findUnique({
      where: payload,
      include: {
        user: {
          include: { role: true },
        },
      },
    });
  }

  updateDevice(
    deviceId: number,
    data: Partial<DeviceBodyType>,
  ): Promise<DeviceBodyType> {
    return this.prismaService.device.update({
      where: { id: deviceId },
      data,
    });
  }

  deleteRefreshToken(token: string): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where: { token },
    });
  }

  deleteVerificationCode(
    payload:
      | { id: number }
      | { email_type: { email: string; type: TypeOfVerification } },
  ): Promise<VerificationCode> {
    return this.prismaService.verificationCode.delete({
      where: payload,
    });
  }
}
