import { SetMetadata } from '@nestjs/common';
import { AuthType, Conditional } from '../constrants/auth-contrants';

export const AuthTypeKey = 'authType';
export const Auth = (
  authType: AuthType[],
  options?: { condition: Conditional },
) => {
  return SetMetadata(AuthTypeKey, { authType, options });
};

export const IsPublic = () => Auth([AuthType.None]);
