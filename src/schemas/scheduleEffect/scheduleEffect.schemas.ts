import { z } from "zod"

export const scheduleEffectIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createScheduleEffectSchema = z.strictObject({
  effectId: z.number().positive("Effect ID is required"),
  scheduleId: z.number().positive("Schedule ID is required"),
})

export type ScheduleEffectId = z.infer<typeof scheduleEffectIdSchema>

export type CreateScheduleEffectSchema = z.infer<
  typeof createScheduleEffectSchema
>
