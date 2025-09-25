import { createZodDto } from 'nestjs-zod';
import {
  CreateRoleSchema,
  GetRoleDetailSchema,
  GetRoleParamsSchema,
  GetRoleQueriesSchema,
  GetRolesResSchema,
  UpdateRoleSchema,
} from './roles.model';

export class GetRolesResDto extends createZodDto(GetRolesResSchema) {}
export class GetRoleParamsDto extends createZodDto(GetRoleParamsSchema) {}
export class GetQueriesRoleDto extends createZodDto(GetRoleQueriesSchema) {}
export class GetRoleDetailDto extends createZodDto(GetRoleDetailSchema) {}
export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
