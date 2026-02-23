import { z } from "zod"
import { auditCreatedFields, auditUpdatedFields } from "../base.schemas"
import { createAddressSchema } from "../address/address.schemas"

export const StatusEnum = z.enum([
  "APROVADO",
  "ENVIADO",
  "CANCELADO",
  "PENDENTE",
])

export const orderIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createOrderSchema = z.strictObject({
  userId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  status: StatusEnum,
  addressId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  shippingAddress: createAddressSchema.optional(),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price invalid"),
})

export const createOrderServiceSchema = createOrderSchema.extend(
  auditCreatedFields.shape,
)

export const updateOrderSchema = z.strictObject({
  status: StatusEnum,
  addressId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  shippingAddress: createAddressSchema.optional().nullable(),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price invalid"),
})

export const updateOrderServiceSchema = updateOrderSchema.extend(
  auditUpdatedFields.shape,
)

export const updateOrderPartialSchema = z.strictObject({
  status: StatusEnum.optional(),
  addressId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive())
    .optional(),
  shippingAddress: createAddressSchema.optional().nullable(),
  total: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .optional(),
})

export type OrderId = z.infer<typeof orderIdSchema>

export type CreateOrderDto = z.infer<typeof createOrderSchema>
export type CreateOrderServiceSchemaInput = z.infer<
  typeof createOrderServiceSchema
>

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>
export type UpdateOrderServiceInput = z.infer<typeof updateOrderServiceSchema>

export type UpdateOrderPartialDto = z.infer<typeof updateOrderPartialSchema>
