import { z } from "zod"

export const IdSchema = z
  .string()
  .regex(/^\d+$/, "ID invalid")
  .transform((value) => parseInt(value))
  .pipe(z.number().positive())

export const DocumentTypeEnum = z.enum(["CPF", "CNPJ"])
export const UserRoleEnum = z.enum([
  "ADMIN",
  "STAFF",
  "FINANCE",
  "PRODUCTION",
  "INSTALLATION",
  "LOGISTICS",
  "PROGRAMMING",
])

export const emailSchema = z.email()

export const phoneSchema = z.string().optional().nullable()

export const documentSchema = z.string().min(1, "Document is required")

export const passwordSchema = z.string().min(1, "Password is required")

export const auditCreatedFields = z.strictObject({
  createdBy: z.number().positive(),
  updatedBy: z.number().positive(),
})

export const auditUpdatedFields = z.strictObject({
  updatedBy: z.number().positive(),
})

export type DocumentType = z.infer<typeof DocumentTypeEnum>
export type UserRole = z.infer<typeof UserRoleEnum>
