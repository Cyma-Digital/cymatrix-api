import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  IdSchema,
} from "../base.schemas"

export const brandIdSchema = z.object({
  id: IdSchema,
})

export const createBrandSchema = z.strictObject({
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required"),
  logoUrl: z.url(),
})

export const createBrandServiceSchema = createBrandSchema.extend(
  auditCreatedFields.shape,
)

export const updateBrandSchema = z.strictObject({
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required"),
  logoUrl: z.url(),
})

export const updateBrandServiceSchema = updateBrandSchema.extend(
  auditUpdatedFields.shape,
)

export const updateBrandPartialSchema = z.strictObject({
  name: z.string().min(1, "name is required").optional(),
  slug: z.string().min(1, "slug is required").optional(),
  logoUrl: z.url().optional(),
  updated: z.number().positive().optional(),
})

export type BrandId = z.infer<typeof brandIdSchema>

export type CreateBrandDto = z.infer<typeof createBrandSchema>
export type CreateBrandServiceSchemaInput = z.infer<
  typeof createBrandServiceSchema
>

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>
export type UpdateBrandServiceInput = z.infer<typeof updateBrandServiceSchema>

export type UpdateBrandPartialDto = z.infer<typeof updateBrandPartialSchema>
