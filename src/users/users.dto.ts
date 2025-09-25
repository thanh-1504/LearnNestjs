import { createZodDto } from 'nestjs-zod';
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto';
import {
  CreaterUserSchema,
  GetListUsersQueriesSchema,
  GetListUsersResSchema,
  GetUserParamSchema,
  UpdateUserSchema,
} from './users.model';

export class CreaterUserDto extends createZodDto(CreaterUserSchema) {}
export class CreateUserResDto extends UpdateProfileResDTO {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class GetListUserResDto extends createZodDto(GetListUsersResSchema) {}
export class GetUserParamDto extends createZodDto(GetUserParamSchema) {}
export class GetListUserQueriesDto extends createZodDto(
  GetListUsersQueriesSchema,
) {}
