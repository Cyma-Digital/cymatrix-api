import { z } from "zod"

export const userTemplateIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createUserTemplateSchema = z.strictObject({
  userId: z.number().positive("User ID is required"),
  templateId: z.number().positive("Template ID is required"),
})

// export const updateUserTemplatePartialSchema = z.strictObject({
//   userId: IdSchema.optional(),
//   templateId: IdSchema.optional(),
// })

export type UserTemplateId = z.infer<typeof userTemplateIdSchema>

export type CreateUserTemplateSchema = z.infer<typeof createUserTemplateSchema>

// export type UpdateUserTemplatePartialDto = z.infer<
//   typeof updateUserTemplatePartialSchema
// >
