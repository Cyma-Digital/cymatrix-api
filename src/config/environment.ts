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
}
