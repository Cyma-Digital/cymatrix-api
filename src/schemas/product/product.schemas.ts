import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  IdSchema,
} from "../base.schemas"

export const productIdSchema = z.object({
  id: IdSchema,
})

export const createProductSchema = z.strictObject({
  categoryId: IdSchema,
  brandId: IdSchema,
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  additionalInfo: z.record(z.any(), z.any()).optional(),
  avaliable: z.boolean(),
  imageUrl: z.url(),
})

export const createProductServiceSchema = createProductSchema.extend(
  auditCreatedFields.shape,
)

export const updateProductSchema = z.strictObject({
  categoryId: IdSchema,
  brandId: IdSchema,
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  additionalInfo: z.record(z.any(), z.any()).optional(),
  avaliable: z.boolean(),
  imageUrl: z.url(),
})

export const updateProductServiceSchema = updateProductSchema.extend(
  auditUpdatedFields.shape,
)

export const updateProductPartialSchema = z.strictObject({
  categoryId: IdSchema.optional(),
  brandId: IdSchema.optional(),
  name: z.string().min(1, "Name is required").optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  additionalInfo: z.record(z.any(), z.any()).optional(),
  avaliable: z.boolean().optional(),
  imageUrl: z.url().optional(),
  updated: z.number().positive().optional(),
})

export const updateProductPartialServiceSchema =
  updateProductPartialSchema.extend(auditUpdatedFields.shape)

export type ProductId = z.infer<typeof productIdSchema>

export type CreateProductDto = z.infer<typeof createProductSchema>
export type CreateProductServiceSchemaInput = z.infer<
  typeof createProductServiceSchema
>

export type UpdateProductDto = z.infer<typeof updateProductSchema>
export type UpdateProductServiceInput = z.infer<
  typeof updateProductServiceSchema
>

export type UpdateProductPartialDto = z.infer<typeof updateProductPartialSchema>
export type UpdateProductPartialServiceInput = z.infer<
  typeof updateProductPartialServiceSchema
>
