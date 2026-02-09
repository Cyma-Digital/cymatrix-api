// scripts/generate-user-payloads.ts
import { faker } from "@faker-js/faker/locale/pt_BR"
import fs from "fs"

/**
 * Gera um CPF válido no formato XXX.XXX.XXX-XX
 */
function generateCPF(): string {
  const n = () => Math.floor(Math.random() * 9)
  const cpf = Array.from({ length: 9 }, n)

  // Calcula primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += cpf[i] * (10 - i)
  }
  cpf.push(((sum * 10) % 11) % 10)

  // Calcula segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += cpf[i] * (11 - i)
  }
  cpf.push(((sum * 10) % 11) % 10)

  const cpfString = cpf.join("")
  return cpfString.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/**
 * Gera um CNPJ válido no formato XX.XXX.XXX/XXXX-XX
 */
function generateCNPJ(): string {
  const n = () => Math.floor(Math.random() * 9)
  const cnpj = Array.from({ length: 12 }, n)

  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += cnpj[i] * weights1[i]
  }
  cnpj.push(sum % 11 < 2 ? 0 : 11 - (sum % 11))

  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += cnpj[i] * weights2[i]
  }
  cnpj.push(sum % 11 < 2 ? 0 : 11 - (sum % 11))

  const cnpjString = cnpj.join("")
  return cnpjString.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  )
}

/**
 * Gera um payload de usuário
 */
function generateUserPayload(
  role: "STAFF" | "ADMIN" | "CLIENT" = "CLIENT",
  documentType: "CPF" | "CNPJ" = "CPF",
) {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.helpers.maybe(() => faker.phone.number("(##) #####-####"), {
      probability: 0.8,
    }),
    document: documentType === "CPF" ? generateCPF() : generateCNPJ(),
    documentType,
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
    admin: generateUserPayload("ADMIN", "CPF"),
    staff: Array.from({ length: 3 }, () => generateUserPayload("STAFF", "CPF")),
    clientCPF: Array.from({ length: 5 }, () =>
      generateUserPayload("CLIENT", "CPF"),
    ),
    clientCNPJ: Array.from({ length: 3 }, () =>
      generateUserPayload("CLIENT", "CNPJ"),
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

console.log("🟡 STAFF (3 exemplos):")
payloads.staff.forEach((staff, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(staff, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("🟢 CLIENT CPF (5 exemplos):")
payloads.clientCPF.forEach((client, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(client, null, 2))
})
console.log("\n-----------------------------------------------------------\n")

console.log("🔵 CLIENT CNPJ (3 exemplos):")
payloads.clientCNPJ.forEach((client, index) => {
  console.log(`\n[${index + 1}]`)
  console.log(JSON.stringify(client, null, 2))
})

console.log("\n═══════════════════════════════════════════════════════════")

// Salvar em arquivo JSON
const outputPath = "./scripts/postman-payloads.json"
fs.writeFileSync(outputPath, JSON.stringify(payloads, null, 2))
console.log(`\n✅ Payloads salvos em: ${outputPath}`)
console.log("═══════════════════════════════════════════════════════════\n")
