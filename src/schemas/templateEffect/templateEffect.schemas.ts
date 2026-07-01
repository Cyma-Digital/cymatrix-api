import { z } from "zod"

export const templateEffectIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createTemplateEffectSchema = z.strictObject({
  effectId: z.number().positive("Effect ID is required"),
  templateId: z.number().positive("Template ID is required"),
})

export type TemplateEffectId = z.infer<typeof templateEffectIdSchema>

export type CreateTemplateEffectSchema = z.infer<
  typeof createTemplateEffectSchema
>
