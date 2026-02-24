import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  IdSchema,
} from "../base.schemas"

export const categoryIdSchema = z.object({
  id: IdSchema,
})

export const createCategorySchema = z.strictObject({
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required"),
  iconUrl: z.url(),
})

export const createCategoryServiceSchema = createCategorySchema.extend(
  auditCreatedFields.shape,
)

export const updateCategorySchema = z.strictObject({
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required"),
  iconUrl: z.url(),
})

export const updateCategoryServiceSchema = updateCategorySchema.extend(
  auditUpdatedFields.shape,
)

export const updateCategoryPartialSchema = z.strictObject({
  name: z.string().min(1, "name is required").optional(),
  slug: z.string().min(1, "slug is required").optional(),
  iconUrl: z.url().optional(),
  updated: z.number().positive().optional(),
})

export type CategoryId = z.infer<typeof categoryIdSchema>

export type CreateCategoryDto = z.infer<typeof createCategorySchema>
export type CreateCategoryServiceSchemaInput = z.infer<
  typeof createCategoryServiceSchema
>

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>
export type UpdateCategoryServiceInput = z.infer<
  typeof updateCategoryServiceSchema
>

export type UpdateCategoryPartialDto = z.infer<
  typeof updateCategoryPartialSchema
>
