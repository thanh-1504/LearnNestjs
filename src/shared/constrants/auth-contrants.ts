export const REQUEST_USER_KEY = 'user';
export const REQUEST_USER_ROLE = 'user_role';

// export enum UserStatus {
//   ACTIVE = 'ACTIVE',
//   INACTIVE = 'INACTIVE',
//   BLOCKED = 'BLOCKED',
// }

export enum AuthType {
  Bearer = 'Bearer',
  ApiKey = 'ApiKey',
  None = 'None',
}

export enum Conditional {
  And = 'And',
  Or = 'Or',
  None = 'None',
}

export interface AuthTypeValue {
  authType: AuthType[];
  options: { condition: Conditional };
}

export enum TypeOfVerification {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  LOGIN = 'LOGIN',
  DISABLE_2FA = 'DISABLE_2FA',
}
