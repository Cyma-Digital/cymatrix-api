import { z } from "zod"

export const userEffectIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createUserEffectSchema = z.strictObject({
  userId: z.number().positive("User ID is required"),
  effectId: z.number().positive("Effect ID is required"),
})

export type UserEffectId = z.infer<typeof userEffectIdSchema>

export type CreateUserEffectSchema = z.infer<typeof createUserEffectSchema>
