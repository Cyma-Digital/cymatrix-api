import prisma from "@/lib/prisma"
import argon2 from "@/lib/argon2"

async function main() {
  const hashedPassword = await argon2.hash("admin123")

  const adminUser = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@mail.com",
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
