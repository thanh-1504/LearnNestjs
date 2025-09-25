import { HTTPMethod } from '@prisma/client';
import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.number().nullable(),
  name: z.string().max(500),
  description: z.string().optional(),
  path: z.string().max(1000),
  method: z.nativeEnum(HTTPMethod),
  module: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
