import { z } from "zod"
import { auditCreatedFields, auditUpdatedFields } from "../base.schemas"

export const contentScheduleIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createContentScheduleSchema = z.strictObject({
  deviceId: z.number().positive("Device ID is required"),
  templateId: z.number().positive("Template ID is required"),
  customFields: z.object({}).passthrough(),
  weekdays: z.array(z.number().min(0).max(6)),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format must be HH:mm")
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format must be HH:mm")
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  active: z.boolean().optional(),
})

export const createContentScheduleServiceSchema =
  createContentScheduleSchema.extend(auditCreatedFields.shape)

export const updateContentScheduleSchema = z.strictObject({
  templateId: z.number().positive().optional(),
  customFields: z.object({}).passthrough().optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format must be HH:mm")
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format must be HH:mm")
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  active: z.boolean().optional(),
})

export const updateContentScheduleServiceSchema =
  updateContentScheduleSchema.extend(auditUpdatedFields.shape)

export type ContentScheduleId = z.infer<typeof contentScheduleIdSchema>
export type CreateContentScheduleDto = z.infer<
  typeof createContentScheduleSchema
>
export type CreateContentScheduleServiceInput = z.infer<
  typeof createContentScheduleServiceSchema
>
export type UpdateContentScheduleDto = z.infer<
  typeof updateContentScheduleSchema
>
export type UpdateContentScheduleServiceInput = z.infer<
  typeof updateContentScheduleServiceSchema
>
