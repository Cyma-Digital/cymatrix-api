import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  jsonValue,
} from "../base.schemas"

export const effectIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createEffectSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1).optional(),
  preset: jsonValue,
  editableFields: jsonValue,
})

export const createEffectServiceSchema = createEffectSchema.extend(
  auditCreatedFields.shape,
)

export const updateEffectSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1).optional(),
  preset: z.record(z.string(), z.unknown()),
  editableFields: jsonValue,
  active: z.boolean().optional(),
})

export const updateEffectServiceSchema = updateEffectSchema.extend(
  auditUpdatedFields.shape,
)

export type EffectId = z.infer<typeof effectIdSchema>
export type CreateEffectDto = z.infer<typeof createEffectSchema>
export type CreateEffectServiceInput = z.infer<typeof createEffectServiceSchema>
export type UpdateEffectDto = z.infer<typeof updateEffectSchema>
export type UpdateEffectServiceInput = z.infer<typeof updateEffectServiceSchema>
