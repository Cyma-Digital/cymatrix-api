import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  IdSchema,
} from "../base.schemas"
import {
  createAddressSchema,
  updateAddressPartialSchema,
  updateAddressSchema,
} from "../address/address.schemas"

export const StatusEnum = z.enum([
  "APROVADO",
  "ENVIADO",
  "CANCELADO",
  "PENDENTE",
])

export const orderIdSchema = z.object({
  id: IdSchema,
})

export const createOrderSchema = z.strictObject({
  userId: IdSchema,
  status: StatusEnum,
  addressId: IdSchema,
  shippingAddress: createAddressSchema.optional(),
  total: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
})

export const createOrderServiceSchema = createOrderSchema.extend(
  auditCreatedFields.shape,
)

export const updateOrderSchema = z.strictObject({
  status: StatusEnum,
  addressId: IdSchema,
  shippingAddress: updateAddressSchema.nullable().optional(),
  total: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
})

export const updateOrderServiceSchema = updateOrderSchema.extend(
  auditUpdatedFields.shape,
)

export const updateOrderPartialSchema = z.strictObject({
  status: StatusEnum.optional(),
  addressId: IdSchema.optional(),
  shippingAddress: updateAddressPartialSchema.nullable().optional(),
  total: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0")
    .optional(),
})

export const updateOrderPartialServiceSchema = updateOrderPartialSchema.extend(
  auditUpdatedFields.shape,
)

export type OrderId = z.infer<typeof orderIdSchema>

export type CreateOrderDto = z.infer<typeof createOrderSchema>
export type CreateOrderServiceSchemaInput = z.infer<
  typeof createOrderServiceSchema
>

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>
export type UpdateOrderServiceInput = z.infer<typeof updateOrderServiceSchema>

export type UpdateOrderPartialDto = z.infer<typeof updateOrderPartialSchema>
export type UpdateOrderPartialServiceInput = z.infer<
  typeof updateOrderPartialServiceSchema
>
