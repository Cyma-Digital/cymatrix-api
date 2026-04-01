// scripts/generate-user-payloads.ts
import { faker } from "@faker-js/faker/locale/pt_BR"
import * as fs from "fs"

type UserRole = "ADMIN" | "STAFF" | "CLIENT"

/**
 * Gera um payload de usuário
 */
function generateUserPayload(role: UserRole = "STAFF") {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.helpers.maybe(
      () => faker.phone.number({ style: "national" }),
      {
        probability: 0.8,
      },
    ),
    password: "Test@123",
    role,
    createdBy: 1,
    updatedBy: 1,
  }
}

/**
 * Gera múltiplos payloads
 */
function generatePayloads() {
  const payloads = {
    admin: generateUserPayload("ADMIN"),
    staff: Array.from({ length: 2 }, () => generateUserPayload("STAFF")),
    client: Array.from({ length: 2 }, () => generateUserPayload("CLIENT")),
  }

  return payloads
}

// Execução
const payloads = generatePayloads()

// Exibir no console
console.log("═══════════════════════════════════════════════════════════")
console.log("📦 PAYLOADS GERADOS PARA POSTMAN")
console.log("═══════════════════════════════════════════════════════════\n")

console.log("🔴 ADMIN:")
console.log(JSON.stringify(payloads.admin, null, 2))
console.log("\n-----------------------------------------------------------\n")

console.log("🟡 STAFF (2 exemplos):")
payloads.staff.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("⚪ CLIENT (2 exemplos):")
payloads.client.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})

console.log("\n═══════════════════════════════════════════════════════════")

// Salvar em arquivo JSON
const outputPath = "./scripts/postman-payloads.json"
fs.writeFileSync(outputPath, JSON.stringify(payloads, null, 2))
console.log(`\n✅ Payloads salvos em: ${outputPath}`)
console.log("═══════════════════════════════════════════════════════════\n")
