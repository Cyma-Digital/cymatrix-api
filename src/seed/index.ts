import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const adminUser = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "System",
      email: "admin@catalog.com",
      phone: "11999999999",
      document: "12345678900",
      documentType: "CPF",
      passwordHash: hashedPassword,
      role: "ADMIN",
      createdBy: null,
      updatedBy: null,
    },
  })

  console.log("✅ Admin user created", adminUser)
}

main()
  .catch((e) => {
    console.log("Error seeding:", e)
  })
  .finally(async () => {
    await prisma.$disconnect
  })
