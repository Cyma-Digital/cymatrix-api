import { z } from "zod"
import {
  auditCreatedFields,
  auditUpdatedFields,
  documentSchema,
  DocumentTypeEnum,
  emailSchema,
  passwordSchema,
  phoneSchema,
  UserRoleEnum,
} from "../base.schemas"

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID invalid")
    .transform((value) => parseInt(value))
    .pipe(z.number().positive()),
})

export const createUserSchama = z.strictObject({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  role: UserRoleEnum,
})

export const createUserServiceSchema = createUserSchama.extend(
  auditCreatedFields.shape,
)

export const updateUserSchema = z.strictObject({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  phone: phoneSchema,
  role: UserRoleEnum,
})

export const updateUserServiceSchema = updateUserSchema.extend(
  auditUpdatedFields.shape,
)

export const updateUserPartialSchema = z.strictObject({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  document: documentSchema.optional(),
  documentType: DocumentTypeEnum.optional(),
  role: UserRoleEnum.optional(),
  updated: z.number().positive().optional(),
})

export type UserId = z.infer<typeof userIdSchema>

export type CreateUserDto = z.infer<typeof createUserSchama>
export type CreateUserServiceSchemaInput = z.infer<
  typeof createUserServiceSchema
>

export type UpdateUserDto = z.infer<typeof updateUserSchema>
export type updateUserServiceInput = z.infer<typeof updateUserServiceSchema>

export type UpdateUserPartialDto = z.infer<typeof updateUserPartialSchema>
