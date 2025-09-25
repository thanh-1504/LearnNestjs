export interface CreateAccessTokenPayload {
  userId: number;
  roleId: number;
  deviceId: number;
  roleName: string;
}

export interface AccessTokenPayload extends CreateAccessTokenPayload {
  exp: number;
  iat: number;
}

export interface CreateRefreshTokenpayload {
  userId: number;
}

export interface RefreshTokenPayload extends CreateRefreshTokenpayload {
  exp: number;
  iat: number;
}
