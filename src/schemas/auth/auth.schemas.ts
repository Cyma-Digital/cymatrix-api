import { strictObject, z } from "zod"
import { emailSchema, passwordSchema } from "@/schemas/base.schemas"

export const loginSchema = strictObject({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginInput = z.infer<typeof loginSchema>
