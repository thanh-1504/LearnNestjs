import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthTypeKey } from '../decorators/auth.decorator';
import {
  AuthType,
  AuthTypeValue,
  Conditional,
} from './../constrants/auth-contrants';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeyGuard } from './api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeMap: Record<string, CanActivate>;
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.ApiKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context);
    const guardType = authTypeValue.authType.map(
      (authType) => this.authTypeMap[authType],
    );
    return authTypeValue?.options?.condition === Conditional.Or
      ? this.handleOrCondition(guardType, context)
      : this.handleAndCondition(guardType, context);
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeValue {
    return (
      this.reflector.getAllAndOverride<AuthTypeValue>(AuthTypeKey, [
        context.getHandler(),
        context.getClass(),
      ]) ?? {
        authType: [AuthType.Bearer],
        options: { conditional: Conditional.None },
      }
    );
  }

  private async handleAndCondition(
    guardType: CanActivate[],
    context: ExecutionContext,
  ) {
    for (const instance of guardType) {
      try {
        if (!(await instance.canActivate(context)))
          throw new UnauthorizedException();
      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new UnauthorizedException();
      }
    }
    return true;
  }

  private async handleOrCondition(
    guardType: CanActivate[],
    context: ExecutionContext,
  ) {
    let lastError: any = null;
    for (const instance of guardType) {
      try {
        if (await instance.canActivate(context)) return true;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof HttpException) throw lastError;
    throw new UnauthorizedException();
  }
}
