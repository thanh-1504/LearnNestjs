import { createZodDto } from 'nestjs-zod';
import {
  CreateLanguageBodySchema,
  GetDetailLanguageResSchema,
  GetLanguageParamsSchema,
  GetLanguagesResSchema,
  UpdateLanguageBodySchema,
} from './language.model';

export class CreateLanguageDto extends createZodDto(CreateLanguageBodySchema) {}
export class UpdateLanguageDto extends createZodDto(UpdateLanguageBodySchema) {}
export class GetLanguagesResDto extends createZodDto(GetLanguagesResSchema) {}
export class GetLanguageParamsDto extends createZodDto(
  GetLanguageParamsSchema,
) {}
export class GetDetailLanguageDto extends createZodDto(
  GetDetailLanguageResSchema,
) {}
