import { z } from "zod"
import { auditCreatedFields, auditUpdatedFields } from "../base.schemas"

export const orderItemIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createOrderItemSchema = z.strictObject({
  orderId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  productId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  quantity: z.number().positive(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price invalid"),
})

export const createOrderItemServiceSchema = createOrderItemSchema.extend(
  auditCreatedFields.shape,
)

export const updateOrderItemSchema = z.strictObject({
  orderId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  productId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
  quantity: z.number().positive(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price invalid"),
})

export const updateOrderItemServiceSchema = updateOrderItemSchema.extend(
  auditUpdatedFields.shape,
)

export const updateOrderItemPartialSchema = z.strictObject({
  orderId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive())
    .optional(),
  productId: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive())
    .optional(),
  quantity: z.number().positive().optional(),
  unitPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price invalid")
    .optional(),
})

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
