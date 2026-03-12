import z from "zod"
import { env } from "./environment"

export const jwtConfigSchema = z.strictObject({
  accessTokenSecret: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  refreshTokenSecret: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  accessTokenExpiration: z.string().default("15m"),
  refreshTokenExpiration: z.string().default("7d"),
})

export const jwtConfig = jwtConfigSchema.parse({
  accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  accessTokenExpiration: env.ACCESS_TOKEN_EXPIRATION,
  refreshTokenExpiration: env.REFRESH_TOKEN_EXPIRATION,
})

export type JwtConfig = z.infer<typeof jwtConfigSchema>
