// scripts/generate-user-payloads.ts
import { faker } from "@faker-js/faker/locale/pt_BR"
import * as fs from "fs"

type UserRole =
  | "ADMIN"
  | "STAFF"
  | "FINANCE"
  | "PRODUCTION"
  | "INSTALLATION"
  | "LOGISTICS"
  | "PROGRAMMING"

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
    finance: Array.from({ length: 2 }, () => generateUserPayload("FINANCE")),
    production: Array.from({ length: 2 }, () =>
      generateUserPayload("PRODUCTION"),
    ),
    installation: Array.from({ length: 3 }, () =>
      generateUserPayload("INSTALLATION"),
    ),
    logistics: Array.from({ length: 2 }, () =>
      generateUserPayload("LOGISTICS"),
    ),
    programming: Array.from({ length: 2 }, () =>
      generateUserPayload("PROGRAMMING"),
    ),
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

console.log("🟢 FINANCE (2 exemplos):")
payloads.finance.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("🔵 PRODUCTION (2 exemplos):")
payloads.production.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("🟠 INSTALLATION (3 exemplos):")
payloads.installation.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("🟣 LOGISTICS (2 exemplos):")
payloads.logistics.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("⚪ PROGRAMMING (2 exemplos):")
payloads.programming.forEach((user, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(user, null, 2))
})

console.log("\n═══════════════════════════════════════════════════════════")

// Salvar em arquivo JSON
const outputPath = "./scripts/postman-payloads.json"
fs.writeFileSync(outputPath, JSON.stringify(payloads, null, 2))
console.log(`\n✅ Payloads salvos em: ${outputPath}`)
console.log("═══════════════════════════════════════════════════════════\n")
