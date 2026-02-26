import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  IdSchema,
} from "../base.schemas"

export const orderItemIdSchema = z.object({
  id: IdSchema,
})

export const createOrderItemSchema = z.strictObject({
  orderId: IdSchema.optional(),
  productId: IdSchema,
  quantity: z.number().positive(),
  unitPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
})

export const createOrderItemServiceSchema = createOrderItemSchema.extend(
  auditCreatedFields.shape,
)

export const updateOrderItemSchema = z.strictObject({
  orderId: IdSchema,
  productId: IdSchema,
  quantity: z.number().positive(),
  unitPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0"),
})

export const updateOrderItemServiceSchema = updateOrderItemSchema.extend(
  auditUpdatedFields.shape,
)

export const updateOrderItemPartialSchema = z.strictObject({
  orderId: IdSchema.optional(),
  productId: IdSchema.optional(),
  quantity: z.number().positive().optional(),
  unitPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .refine((value) => Number(value) > 0, "Price must be greater than 0")
    .optional(),
})

export const updateOrderItemPartialServiceSchema =
  updateOrderItemPartialSchema.extend(auditUpdatedFields.shape)

export type OrderItemId = z.infer<typeof orderItemIdSchema>

export type CreateOrderItemDto = z.infer<typeof createOrderItemSchema>
export type CreateOrderItemServiceSchemaInput = z.infer<
  typeof createOrderItemServiceSchema
>

export type UpdateOrderItemDto = z.infer<typeof updateOrderItemSchema>
export type UpdateOrderItemServiceInput = z.infer<
  typeof updateOrderItemServiceSchema
>

export type UpdateOrderItemPartialDto = z.infer<
  typeof updateOrderItemPartialSchema
>
export type UpdateOrderItemPartialServiceInput = z.infer<
  typeof updateOrderItemPartialServiceSchema
>
