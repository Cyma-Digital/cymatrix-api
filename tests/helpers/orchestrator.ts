import prisma from "../../src/lib/prisma"
import argon2 from "../../src/lib/argon2"
import { execSync } from "child_process"

class Orchestrator {
  async setup() {
    try {
      await this.clearDatabase()
      await this.runMigrations()
      await this.createUserForTest()
      await this.tearDown()
    } catch (error) {
      console.log("Orchestrator setup failed: ", error)
    }
  }

  private async clearDatabase(): Promise<void> {
    console.log("✓ Dropping schema...")
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS local CASCADE;`

    console.log("✓ Creating schema...")
    await prisma.$executeRaw`CREATE SCHEMA local;`
  }

  private async runMigrations(): Promise<void> {
    try {
      execSync(`npm run  prisma:migrations:deploy`, {
        stdio: "inherit",
      })
    } catch (error) {
      console.error("Migrations failed:", error)
    }
  }

  private async createUserForTest(): Promise<void> {
    const hashedPassword = await argon2.hash("admin123")

    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        phone: "11999999999",
        document: "12345678900",
        documentType: "CPF",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    })
  }

  async tearDown(): Promise<void> {
    try {
      console.log("✓ User admin@test.com created")
      await prisma.$disconnect()
    } catch (error) {
      console.error("Failed to disconnect", error)
    }
  }
}

export const orchestrator = new Orchestrator()
