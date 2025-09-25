import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HTTPMethod } from '@prisma/client';
import {
  REQUEST_USER_KEY,
  REQUEST_USER_ROLE,
} from '../constrants/auth-contrants';
import { PrismaService } from '../services/prisma.service';
import { TokenService } from '../services/token.service';
import { AccessTokenPayload } from '../types/jwt.type';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.getAccessTokenFromHeader(request);
    const decoded = await this.vefiryAccessToken(request);
    await this.validateUserPermission(decoded, request);
    return true;
  }

  private async vefiryAccessToken(request: any): Promise<AccessTokenPayload> {
    try {
      const accessToken = this.getAccessTokenFromHeader(request);
      const decoded = await this.tokenService.vefiryAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decoded;

      return decoded;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  private getAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) throw new UnauthorizedException('AccessToken not found!');
    return accessToken;
  }

  private async validateUserPermission(
    decodedAccessToken: AccessTokenPayload,
    request: any,
  ) {
    const roleId = decodedAccessToken.roleId;
    const path = request.route.path;
    const method = request.method as keyof typeof HTTPMethod;
    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: { id: roleId, deletedAt: null, isActive: true },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              method,
              path,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException();
      });
    const canAccess = role.permissions.length > 0;
    if (!canAccess) throw new ForbiddenException();
    request[REQUEST_USER_ROLE] = role;
  }
}
