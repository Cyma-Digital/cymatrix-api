import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  jsonValue,
} from "../base.schemas"

export const templateIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createTemplateSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1).optional(),
  preset: jsonValue,
  editableFields: jsonValue,
})

export const createTemplateServiceSchema = createTemplateSchema.extend(
  auditCreatedFields.shape,
)

export const updateTemplateSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1).optional(),
  preset: z.record(z.string(), z.unknown()),
  editableFields: jsonValue,
  active: z.boolean().optional(),
})

export const updateTemplateServiceSchema = updateTemplateSchema.extend(
  auditUpdatedFields.shape,
)

export type TemplateId = z.infer<typeof templateIdSchema>
export type CreateTemplateDto = z.infer<typeof createTemplateSchema>
export type CreateTemplateServiceInput = z.infer<
  typeof createTemplateServiceSchema
>
export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>
export type UpdateTemplateServiceInput = z.infer<
  typeof updateTemplateServiceSchema
>
