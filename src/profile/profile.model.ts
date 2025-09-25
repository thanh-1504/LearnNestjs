import {
  GetUserProfileResSchema,
  UserSchema,
} from 'src/shared/models/share-user.model';
import { z } from 'zod';

export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const UpdateMeSchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).strict();

export const ChangePasswordSchema = UserSchema.pick({
  password: true,
})
  .extend({
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword)
      ctx.addIssue({
        code: 'custom',
        message: 'New password must match confirmPassword',
        path: ['newPassword,confirmPassword'],
      });
  });

export type UpdateMeType = z.infer<typeof UpdateMeSchema>;
export type UpdateProfileType = z.infer<typeof UpdateProfileResSchema>;
export type GetUserProfileType = z.infer<typeof GetUserProfileResSchema>;
export type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;
