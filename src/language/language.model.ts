import { z } from 'zod';

export const LanguageBodySchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetLanguagesResSchema = z.object({
  data: z.array(LanguageBodySchema),
  totalItems: z.number(),
});

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(10),
  })
  .strict();

export const CreateLanguageBodySchema = LanguageBodySchema.pick({
  id: true,
  name: true,
}).strict();

export const UpdateLanguageBodySchema = LanguageBodySchema.pick({
  name: true,
}).strict();

export const GetDetailLanguageResSchema = LanguageBodySchema;

export type LanguageBodyType = z.infer<typeof LanguageBodySchema>;
export type GetLanguagesResType = z.infer<typeof GetLanguagesResSchema>;
export type GetDetailLanguageResType = z.infer<
  typeof GetDetailLanguageResSchema
>;
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>;
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>;
