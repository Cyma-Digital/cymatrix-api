import "dotenv/config"

function required(name: string): string {
  const envValue = process.env[name]
  if (!envValue) {
    throw new Error(`Enviriment variable ${name} is not defined`)
  }

  return envValue
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  POSTGRES_SCHEMA: required("POSTGRES_SCHEMA"),
  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRATION: required("ACCESS_TOKEN_EXPIRATION"),
  REFRESH_TOKEN_EXPIRATION: required("REFRESH_TOKEN_EXPIRATION"),
}
