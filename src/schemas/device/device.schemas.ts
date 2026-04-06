import { z } from "zod"
import { auditCreatedFields, auditUpdatedFields } from "../base.schemas"

export const deviceIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createDeviceSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().length(2, "State must be 2 characters").optional(),
  zipCode: z.string().min(1).optional(),
})

export const createDeviceServiceSchema = createDeviceSchema.extend(
  auditCreatedFields.shape,
)

export const updateDeviceSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().length(2, "State must be 2 characters").optional(),
  zipCode: z.string().min(1).optional(),
})

export const updateDeviceServiceSchema = updateDeviceSchema.extend(
  auditUpdatedFields.shape,
)

export const updateDevicePartialSchema = z.strictObject({
  name: z.string().min(1, "Name is required").optional(),
  code: z.string().min(1, "Code is required").optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().length(2, "State must be 2 characters").optional(),
  zipCode: z.string().min(1).optional(),
})

export type DeviceId = z.infer<typeof deviceIdSchema>
export type CreateDeviceDto = z.infer<typeof createDeviceSchema>
export type CreateDeviceServiceInput = z.infer<typeof createDeviceServiceSchema>
export type UpdateDeviceDto = z.infer<typeof updateDeviceSchema>
export type UpdateDeviceServiceInput = z.infer<typeof updateDeviceServiceSchema>
export type UpdateDevicePartialDto = z.infer<typeof updateDevicePartialSchema>
