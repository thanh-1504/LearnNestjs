import { TypeOfVerification } from 'src/shared/constrants/auth-contrants';
import { UserSchema } from 'src/shared/models/share-user.model';
import { z } from 'zod';

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Confirm password must match password',
        path: ['confirmPassword'],
      });
    }
  });

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const VerificationCodeSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
  code: z.string(),
  type: z.nativeEnum(TypeOfVerification),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
});

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .strict()
  .extend({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  });

export const LoginBodyResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export const RefreshTokenResponseSchema = LoginBodyResponseSchema;

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const DeviceBodySchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export const GoogleAuthStateSchema = DeviceBodySchema.pick({
  ip: true,
  userAgent: true,
});

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deleteAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ForgotPasswordSchema = z
  .object({
    email: z.string(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Newpassword and Confirmpassword must match',
        path: ['confirmPassword'],
      });
    }
  });

export const LogoutBodySchema = RefreshTokenBodySchema;

export const DisableTwoFactoryBodySchema = z
  .object({
    totpCode: z.string().length(6),
    code: z.string().length(6),
  })
  .superRefine(({ totpCode, code }, ctx) => {
    if ((totpCode !== undefined) === (code !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter totpCode or code',
        path: ['totpCode'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter totpCode or code',
        path: ['code'],
      });
    }
  });

export const TwoFactorySetupResSchema = z.object({
  secret: z.string(),
  uri: z.string(),
});

// Types
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type LoginBodyResponseType = z.infer<typeof LoginBodyResponseSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type RefreshTokenResponseType = z.infer<
  typeof RefreshTokenResponseSchema
>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type DeviceBodyType = z.infer<typeof DeviceBodySchema>;
export type RoleType = z.infer<typeof RoleSchema>;
export type LogoutBodyType = RefreshTokenBodyType;
export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>;
export type GetAuthorizationUrlResType = z.infer<
  typeof GetAuthorizationUrlResSchema
>;
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordSchema>;
export type DisableTwoFactoryBodyType = z.infer<
  typeof DisableTwoFactoryBodySchema
>;
export type TwoFactorySetupResType = z.infer<typeof TwoFactorySetupResSchema>;
