import { createZodDto } from 'nestjs-zod';
import {
  CreatePermissionSchema,
  GetPermissionDetailSchema,
  GetPermissionParamsSchema,
  GetPermissionQuerySchema,
  GetPermissionResSchema,
  UpdatePermissionSchema,
} from './permission.model';

export class CreatePermissionDto extends createZodDto(CreatePermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(UpdatePermissionSchema) {}
export class GetPermissionResDto extends createZodDto(GetPermissionResSchema) {}
export class GetPermissionDetailResDto extends createZodDto(
  GetPermissionDetailSchema,
) {}
export class GetPermissionParamsDto extends createZodDto(
  GetPermissionParamsSchema,
) {}
export class GetPermissionQueryDto extends createZodDto(
  GetPermissionQuerySchema,
) {}
