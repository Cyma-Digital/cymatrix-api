import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  IdSchema,
} from "../base.schemas"

export const addressIdSchema = z.object({
  id: IdSchema,
})

export const createAddressSchema = z.strictObject({
  userId: IdSchema,
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street is required"),
  number: z.number().positive(),
  complement: z
    .string()
    .min(1, "Complement is required")
    .optional()
    .nullable()
    .transform((value) => value ?? null),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "ZipCode is invalid"),
  isDefault: z.boolean(),
})

export const createAddressServiceSchema = createAddressSchema.extend(
  auditCreatedFields.shape,
)

export const updateAddressSchema = z.strictObject({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street is required"),
  number: z.number().positive(),
  complement: z
    .string()
    .min(1, "Complement is required")
    .optional()
    .nullable()
    .transform((value) => value ?? null),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "ZipCode is invalid"),
  isDefault: z.boolean(),
})

export const updateAddressServiceSchema = updateAddressSchema.extend(
  auditUpdatedFields.shape,
)

export const updateAddressPartialSchema = z.strictObject({
  label: z.string().min(1, "Label is required").optional(),
  street: z.string().min(1, "Street is required").optional(),
  number: z.number().positive().optional(),
  complement: z
    .string()
    .min(1, "Complement is required")
    .optional()
    .transform((value) => value ?? null),
  neighborhood: z.string().min(1, "Neighborhood is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "ZipCode is invalid")
    .optional(),
  isDefault: z.boolean().optional(),
  updated: z.number().positive().optional(),
})

export type AddressId = z.infer<typeof addressIdSchema>

export type CreateAddressDto = z.infer<typeof createAddressSchema>
export type CreateAddressServiceSchemaInput = z.infer<
  typeof createAddressServiceSchema
>

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>
export type UpdateAddressServiceInput = z.infer<
  typeof updateAddressServiceSchema
>

export type UpdateAddressPartialDto = z.infer<typeof updateAddressPartialSchema>
