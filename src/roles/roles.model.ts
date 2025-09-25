import {
  RolePermissionSchema,
  RoleSchema,
} from 'src/shared/models/shared-role.model';
import { z } from 'zod';

export const GetRolesResSchema = z.object({
  page: z.coerce.number(),
  limit: z.coerce.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  data: z.array(RoleSchema),
});

export const GetRoleQueriesSchema = z
  .object({
    page: z.coerce.number().int().default(1),
    limit: z.coerce.number().int().default(10),
  })
  .strict();

export const GetRoleParamsSchema = z
  .object({
    roleId: z.coerce.number(),
  })
  .strict();

export const GetRoleDetailSchema = RolePermissionSchema;

export const CreateRoleSchema = RoleSchema.pick({
  name: true,
  isActive: true,
  description: true,
}).strict();

export const CreateRoleResSchema = RoleSchema;

export const UpdateRoleSchema = RoleSchema.pick({
  name: true,
  isActive: true,
  description: true,
})
  .extend({
    permissionIds: z.array(z.number()),
  })
  .strict();

export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleType = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleType = z.infer<typeof UpdateRoleSchema>;
export type GetRolesResType = z.infer<typeof GetRolesResSchema>;
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>;
export type GetRoleQueriesType = z.infer<typeof GetRoleQueriesSchema>;
export type GetRoleDetailType = z.infer<typeof GetRoleDetailSchema>;
