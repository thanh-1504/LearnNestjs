import { PermissionSchema } from 'src/shared/models/share-permission.model';
import * as z from 'zod';

export const GetPermissionResSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  data: z.array(PermissionSchema),
});

export const GetPermissionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
  })
  .strict();

export const GetPermissionDetailSchema = PermissionSchema;

export const CreatePermissionSchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
}).strict();

export const UpdatePermissionSchema = CreatePermissionSchema;

export type PermissionType = z.infer<typeof PermissionSchema>;
export type CreatePermissionType = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionType = z.infer<typeof UpdatePermissionSchema>;
export type GetPermissionQueryType = z.infer<typeof GetPermissionQuerySchema>;
export type GetPermissionResType = z.infer<typeof GetPermissionResSchema>;
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;
export type GetPermissionDetailType = z.infer<typeof GetPermissionDetailSchema>;
