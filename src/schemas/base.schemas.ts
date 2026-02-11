import { z } from "zod"

export const DocumentTypeEnum = z.enum(["CPF", "CNPJ"])
export const UserRoleEnum = z.enum(["ADMIN", "STAFF", "CLIENT"])

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
