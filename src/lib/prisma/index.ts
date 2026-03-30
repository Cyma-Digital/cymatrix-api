import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "@/config/environment"

const connectionString = env.DATABASE_URL
const isLocal = connectionString.includes("localhost")

const adapter = new PrismaPg(
  {
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
  {
    schema: env.POSTGRES_SCHEMA,
  },
)
const prisma = new PrismaClient({
  adapter,
})

export default prisma
