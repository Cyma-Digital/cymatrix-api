import { z } from "zod"

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export type UserId = z.infer<typeof userIdSchema>
