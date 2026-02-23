import { z } from "zod"
import { auditCreatedFields, auditUpdatedFields } from "../base.schemas"

export const productIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createProductSchema = z.strictObject({
  categoryId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  brandId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  name: z.string().min(1, "Name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price invalid"),
  // .transform((value) => Number(value))
  // .pipe(z.number().positive()),
  description: z.string().min(1, "Description is required"),
  additionalInfo: z.string(),
  avaliable: z.boolean(),
  imageUrl: z.url(),
})

export const createProductServiceSchema = createProductSchema.extend(
  auditCreatedFields.shape,
)

export const updateProductSchema = z.strictObject({
  categoryId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  brandId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  name: z.string().min(1, "Name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price invalid"),
  // .transform((value) => Number(value))
  // .pipe(z.number().positive()),
  description: z.string().min(1, "Description is required"),
  additionalInfo: z.string(),
  avaliable: z.boolean(),
  imageUrl: z.url(),
})

export const updateProductServiceSchema = updateProductSchema.extend(
  auditUpdatedFields.shape,
)

export const updateProductPartialSchema = z.strictObject({
  categoryId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive())
    .optional(),
  brandId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive())
    .optional(),
  name: z.string().min(1, "Name is required").optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    // .transform((value) => Number(value))
    // .pipe(z.number().positive())
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  additionalInfo: z.string().optional(),
  avaliable: z.boolean().optional(),
  imageUrl: z.url().optional(),
  updated: z.number().positive().optional(),
})

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
