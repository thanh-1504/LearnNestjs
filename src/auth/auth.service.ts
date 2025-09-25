import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import envConfig from 'src/shared/config';
import { TypeOfVerification } from 'src/shared/constrants/auth-contrants';
import {
  generateOtpCode,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helpers/helper';
import { SharedRoleService } from 'src/shared/repositories/share-role.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { CreateAccessTokenPayload } from 'src/shared/types/jwt.type';
import { TwoFactorAuthService } from './../shared/services/2fa.service';
import { EmailService } from './../shared/services/email.service';
import { AuthRepository } from './auth-repository';
import {
  DisableTwoFactoryBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOtpBodyType,
} from './auth.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly sharedRoleService: SharedRoleService,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async validateOtpCode({
    email,
    code,
    type,
  }: {
    email: string;
    code: string;
    type: TypeOfVerification;
  }) {
    const verificationCode =
      await this.authRepository.findUniqueVerificationCode({
        email_type: {
          email,
          type,
        },
      });

    if (!verificationCode || verificationCode.code !== code)
      throw new UnprocessableEntityException({
        message: 'Otp invalid',
        path: 'code',
      });

    if (verificationCode.expiresAt < new Date())
      throw new UnprocessableEntityException({
        message: 'OTP code has expired',
        path: 'code',
      });
  }

  async register(body: RegisterBodyType) {
    try {
      // 1. Xác thực mã OTP
      this.validateOtpCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerification.REGISTER,
      });
      // 2. Tạo user nếu mã otp valid
      const { name, email, password } = body;
      const [newUser, _] = await Promise.all([
        this.prismaService.user.create({
          data: {
            name: name,
            email: email,
            phoneNumber: body.phoneNumber,
            password: await this.hashingService.hashPassword(password),
            roleId: await this.sharedRoleService.getClientRoleId(),
          },
          // select: {
          //   id: true,
          //   name: true,
          //   email: true,
          // },
        }),
        this.authRepository.deleteVerificationCode({
          email_type: {
            email,
            type: TypeOfVerification.REGISTER,
          },
        }),
      ]);
      return newUser;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email already exist');
      }
      throw error;
    }
  }

  async sendOtp(sendOtpBodyDto: SendOtpBodyType) {
    // 1. Kiểm tra xem email đã được đăng ký trong dbs hay chưa
    const { email, type } = sendOtpBodyDto;
    const user = await this.shareUserRepository.findUnique({
      email: sendOtpBodyDto.email,
      deletedAt: null,
    });
    if (user && type === TypeOfVerification.REGISTER)
      throw new UnprocessableEntityException({
        message: 'Email are already exists',
        path: 'email',
      });
    if (!user && type === TypeOfVerification.FORGOT_PASSWORD)
      throw new UnprocessableEntityException({
        message: 'Email not found',
        path: 'email',
      });
    // 2. Nếu user chưa có trong dbs thì generate otp
    const otpCode = generateOtpCode();
    // 3. Gửi OTP code đó về email cho user
    const { error } = await this.emailService.sendMailWithOtp({
      email,
      otpCode,
    });
    if (error)
      throw new UnprocessableEntityException({
        message: 'Send OTP code fail',
        path: 'code',
      });
    // 4. Lưu 1 record của otp
    this.authRepository.createVerificationCode({
      email,
      code: otpCode,
      type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    });
    return { message: 'Send OTP code successfully' };
  }

  async login(loginDto: LoginBodyType & { userAgent: string; ip: string }) {
    // 1. Kiểm tra email có trong dbs không
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: loginDto.email,
      deletedAt: null,
    });
    if (!user) throw new UnauthorizedException('Email is not exist');
    const correctPassword = await this.hashingService.comparePassword(
      loginDto.password,
      user.password,
    );
    // 2. Kiểm tra password có chính xác không
    if (!correctPassword)
      throw new UnprocessableEntityException([
        { field: 'password', message: 'Password is incorrect' },
      ]);

    // Kiểm tra người dùng có bật 2FA không
    if (user.totpSecret) {
      if (!loginDto.totpCode && !loginDto.code)
        throw new UnprocessableEntityException({
          code: 'custom',
          message: 'Invalid TOTPCode and Code',
          path: ['totp', 'code'],
        });
      if (loginDto.totpCode) {
        const isValid = this.twoFactorAuthService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: loginDto.totpCode,
        });
        if (!isValid)
          throw new UnprocessableEntityException({
            code: 'custom',
            message: 'TOTP Code invalid',
            path: ['totp code'],
          });
      } else if (loginDto.code) {
        await this.validateOtpCode({
          email: user.email,
          code: loginDto.code,
          type: TypeOfVerification.LOGIN,
        });
      }
    }
    // 3. Tạo 1 record device khi người dùng login
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: loginDto.userAgent,
      ip: loginDto.ip,
    });
    // 4. Trả tokens về cho user
    const tokens = this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });
    return tokens;
  }

  async generateTokens({
    userId,
    deviceId,
    roleId,
    roleName,
  }: CreateAccessTokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({ userId }),
    ]);
    const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: decoded.userId,
      deviceId,
      expiresAt: new Date(decoded.exp * 1000),
    });
    return { accessToken, refreshToken };
  }

  async refreshToken({
    refreshToken,
    userAgent,
    ip,
  }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Kiểm tra refreshToken có valid không
      const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. Kiểm tra rt có tồn tại trong db không
      const refreshTokenInDb =
        await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
          token: refreshToken,
        });
      if (!refreshTokenInDb)
        throw new UnauthorizedException('Refresh Token đã được sử dụng');
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb;
      // 3. Cập nhật device
      const $updatedDevice = this.authRepository.updateDevice(
        refreshTokenInDb.deviceId,
        { ip, userAgent },
      );
      // 4. Xóa rt cũ
      const $deleteRefreshToken =
        this.authRepository.deleteRefreshToken(refreshToken);

      const $tokens = this.generateTokens({
        userId: decoded.userId,
        deviceId,
        roleId,
        roleName,
      });
      const [, , tokens] = await Promise.all([
        $updatedDevice,
        $deleteRefreshToken,
        $tokens,
      ]);
      return tokens;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new UnauthorizedException();
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra rt có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken);
      // 2. Xóa rt trong db
      const deletedRefreshToken =
        await this.authRepository.deleteRefreshToken(refreshToken);
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      });
      return { message: 'Logout successfully' };
    } catch (error) {
      if (isNotFoundPrismaError(error))
        throw new UnauthorizedException('Refresh Token has been revoked');
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordBodyType) {
    // 1. Kiểm tra email có tồn tại trong db không
    const { email, code, newPassword } = forgotPasswordDto;
    const user = await this.shareUserRepository.findUnique({
      email,
      deletedAt: null,
    });
    if (!user)
      throw new UnprocessableEntityException({
        message: 'Email not found',
        path: 'email',
      });
    // 2. Xác thực otp có hợp lệ không
    this.validateOtpCode({
      email,
      code,
      type: TypeOfVerification.FORGOT_PASSWORD,
    });
    // 3. Update thông tin user nếu otp valid
    const [updatedUser, _] = await Promise.all([
      this.shareUserRepository.updateUser(
        { id: user.id, deletedAt: null },
        {
          password: await this.hashingService.hashPassword(newPassword),
          updatedById: user.id,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_type: {
          email,
          type: TypeOfVerification.FORGOT_PASSWORD,
        },
      }),
    ]);
    return { message: 'Update user password successfully' };
  }

  async setupTwoFactorAuth(userId: number) {
    // 1. lấy thông tin user kiểm tra user có tồn tại không và xem có bật 2FA chưa
    const user = await this.shareUserRepository.findUnique({
      id: userId,
      deletedAt: null,
    });
    if (!user)
      throw new UnprocessableEntityException({
        code: 'custom',
        message: 'User not found',
        path: ['email'],
      });
    if (user && user.totpSecret)
      throw new UnprocessableEntityException({
        code: 'custom',
        message: '2FA already enable',
        path: ['totpCode'],
      });
    // 2. Tạo secret và uri
    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(
      user.email,
    );
    await this.shareUserRepository.updateUser(
      { id: user.id, deletedAt: null },
      { totpSecret: secret, updatedById: user.id },
    );
    return {
      secret,
      uri,
    };
  }

  async disableTwoFactoryAuth(
    body: DisableTwoFactoryBodyType & { userId: number },
  ) {
    const { userId, totpCode, code } = body;
    // 1. Lấy thông tin user, kiểm tra xem user có tồn tại hay không, và xem họ đã bật 2FA chưa
    const user = await this.shareUserRepository.findUnique({ id: userId });
    if (!user)
      throw new UnprocessableEntityException({
        code: 'custom',
        message: 'User not found',
        path: 'email',
      });
    if (!user.totpSecret)
      throw new UnprocessableEntityException({
        code: 'custom',
        message: 'TOTP 2FA not enable',
        path: 'totpCode',
      });
    // 2. Kiểm tra mã TOTP có hợp lệ hay không
    if (totpCode) {
      const isValid = this.twoFactorAuthService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      });
      if (!isValid)
        throw new UnprocessableEntityException({
          code: 'custom',
          message: 'TOTP Code invalid',
          path: 'totpCode',
        });
    } else if (code) {
      // 3. Kiểm tra mã OTP email có hợp lệ hay không
      await this.validateOtpCode({
        email: user.email,
        code,
        type: TypeOfVerification.DISABLE_2FA,
      });
    }
    // 4. Cập nhật secret thành null
    await this.shareUserRepository.updateUser(
      { id: userId, deletedAt: null },
      { totpSecret: null, updatedById: user.id },
    );
    return {
      message: 'Disable 2FA successfully',
    };
  }
}
