import { UserSchema } from 'src/shared/models/share-user.model';
import { RoleSchema } from 'src/shared/models/shared-role.model';
import { z } from 'zod';

export const GetListUsersResSchema = z.object({
  data: z.array(
    UserSchema.omit({ password: true, totpSecret: true }).extend({
      role: RoleSchema.pick({
        id: true,
        name: true,
      }),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetListUsersQueriesSchema = z
  .object({
    page: z.coerce.number().int().default(1),
    limit: z.coerce.number().int().default(10),
  })
  .strict();

export const GetUserParamSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict();

export const CreaterUserSchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  password: true,
  roleId: true,
  status: true,
}).strict();

export const UpdateUserSchema = CreaterUserSchema;

export type CreateUserType = z.infer<typeof CreaterUserSchema>;
export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
export type GetListUsersQueriesType = z.infer<typeof GetListUsersQueriesSchema>;
export type GetListUsersResType = z.infer<typeof GetListUsersResSchema>;
export type GetUserParamsType = z.infer<typeof GetUserParamSchema>;
