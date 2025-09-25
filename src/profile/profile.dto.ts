import { createZodDto } from 'nestjs-zod';
import {
  ChangePasswordSchema,
  UpdateMeSchema,
  UpdateProfileResSchema,
} from './profile.model';
import { GetUserProfileResSchema } from 'src/shared/models/share-user.model';

export class GetUserProfileDto extends createZodDto(GetUserProfileResSchema) {}
export class UpdateProfileDto extends createZodDto(UpdateProfileResSchema) {}
export class UpdateMeDto extends createZodDto(UpdateMeSchema) {}
export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
