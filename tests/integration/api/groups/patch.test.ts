import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string

async function createClientAndLogin(email: string) {
  await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      firstName: "Client",
      lastName: "User",
      email,
      phone: "11988888888",
      password: "client123",
      role: "CLIENT",
    })

  const login = await request(app).post("/api/auth/login").send({
    email,
    password: "client123",
  })

  return login.body.data.access as string
}

async function createGroup(authToken: string, name: string) {
  const response = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${authToken}`)
    .send({ name })
  return response.body.data.id as number
}

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/groups/:id", () => {
  test("should return 401 without authentication", async () => {
    const response = await request(app)
      .patch("/api/groups/1")
      .send({ name: "Novo nome" })

    expect(response.status).toBe(401)
  })

  test("should rename the group for the owner", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Nome antigo")

    const response = await request(app)
      .patch(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ name: "Nome novo" })

    expect(response.status).toBe(200)
    expect(response.body.data.name).toBe("Nome novo")
  })

  test("should return 403 for a CLIENT that does not own the group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")
    const groupId = await createGroup(clientToken, "Nome antigo")

    const response = await request(app)
      .patch(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ name: "Invasão" })

    expect(response.status).toBe(403)
  })

  test("should allow ADMIN to rename any group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Nome antigo")

    const response = await request(app)
      .patch(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Renomeado pelo admin" })

    expect(response.status).toBe(200)
    expect(response.body.data.name).toBe("Renomeado pelo admin")
  })

  test("should return 404 when group does not exist", async () => {
    const response = await request(app)
      .patch("/api/groups/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Fantasma" })

    expect(response.status).toBe(404)
  })

  test("should return 400 when name is missing", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Nome antigo")

    const response = await request(app)
      .patch(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({})

    expect(response.status).toBe(400)
  })
})
