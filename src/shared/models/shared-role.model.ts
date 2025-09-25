import { z } from 'zod';
import { PermissionSchema } from './share-permission.model';

export const RoleSchema = z.object({
  id: z.number().int(),
  name: z.string().max(500),
  description: z.string().max(500),
  isActive: z.boolean().default(true),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const RolePermissionSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export type RoleType = z.infer<typeof RoleSchema>;
export type RolePermissionType = z.infer<typeof RolePermissionSchema>;
