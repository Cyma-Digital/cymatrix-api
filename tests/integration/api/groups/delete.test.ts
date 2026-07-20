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

describe("DELETE /api/groups/:id", () => {
  test("should return 401 without authentication", async () => {
    const response = await request(app).delete("/api/groups/1")
    expect(response.status).toBe(401)
  })

  test("should soft-delete the group and remove it from listings", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Grupo obsoleto")

    const response = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    expect(response.status).toBe(204)

    const listResponse = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${clientToken}`)
    expect(listResponse.body.data).toHaveLength(0)

    const getResponse = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)
    expect(getResponse.status).toBe(404)
  })

  test("should return 403 for a CLIENT that does not own the group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")
    const groupId = await createGroup(clientToken, "Grupo protegido")

    const response = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${otherToken}`)

    expect(response.status).toBe(403)
  })

  test("should allow ADMIN to delete any group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Grupo do cliente")

    const response = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(204)
  })

  test("should return 404 when group does not exist", async () => {
    const response = await request(app)
      .delete("/api/groups/99999")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(404)
  })
})
