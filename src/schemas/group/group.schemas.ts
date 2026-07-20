import { z } from "zod"
import {
  IdSchema,
  auditCreatedFields,
  auditUpdatedFields,
} from "../base.schemas"

export const groupIdSchema = z.object({
  id: IdSchema,
})

export const createGroupSchema = z.strictObject({
  name: z.string().min(1, "Name is required").max(100),
  userId: z.number().positive().optional(),
  deviceIds: z.array(z.number().positive()).max(100).optional(),
})

export const createGroupServiceSchema = createGroupSchema.extend(
  auditCreatedFields.shape,
)

export const addGroupDeviceSchema = z.strictObject({
  deviceIds: z
    .array(z.number().positive())
    .min(1, "At least one device is required")
    .max(100),
})

export const groupDeviceParamsSchema = z.object({
  id: IdSchema,
  deviceId: IdSchema,
})

export const updateGroupSchema = z.strictObject({
  name: z.string().min(1, "Name is required").max(100),
})

export const updateGroupServiceSchema = updateGroupSchema.extend(
  auditUpdatedFields.shape,
)

export type GroupId = z.infer<typeof groupIdSchema>
export type AddGroupDeviceDto = z.infer<typeof addGroupDeviceSchema>
export type CreateGroupDto = z.infer<typeof createGroupSchema>
export type CreateGroupServiceInput = z.infer<typeof createGroupServiceSchema>
export type UpdateGroupDto = z.infer<typeof updateGroupSchema>
export type UpdateGroupServiceInput = z.infer<typeof updateGroupServiceSchema>
