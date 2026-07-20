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

describe("GET /api/groups", () => {
  test("should return 401 without authentication", async () => {
    const response = await request(app).get("/api/groups")
    expect(response.status).toBe(401)
  })

  test("should list only the requester's groups for CLIENT", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")

    await createGroup(clientToken, "Grupo do cliente")
    await createGroup(otherToken, "Grupo do outro")

    const response = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${clientToken}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toBe("Grupo do cliente")
  })

  test("should list all groups for ADMIN", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")

    await createGroup(clientToken, "Grupo A")
    await createGroup(otherToken, "Grupo B")

    const response = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(2)
  })
})

describe("GET /api/groups/:id", () => {
  test("should return group details for the owner", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Minha loja")

    const response = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: groupId,
      name: "Minha loja",
    })
  })

  test("should return 403 for a CLIENT that does not own the group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")
    const groupId = await createGroup(clientToken, "Minha loja")

    const response = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${otherToken}`)

    expect(response.status).toBe(403)
  })

  test("should allow ADMIN to view any group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Minha loja")

    const response = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(200)
  })

  test("should return 404 when group does not exist", async () => {
    const response = await request(app)
      .get("/api/groups/99999")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(404)
  })

  test("should not list soft-deleted devices in group detail", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(clientToken, "Minha loja")

    // Orchestrator truncates with RESTART IDENTITY: admin is user 1, the
    // client created above is user 2.
    const clientId = 2

    const deviceRes = await request(app)
      .post("/api/devices")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Device A", code: "DEV001" })
    const deviceId = deviceRes.body.data.id

    await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId: clientId })

    await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ deviceIds: [deviceId] })

    await request(app)
      .delete(`/api/devices/${deviceId}`)
      .set("Authorization", `Bearer ${token}`)

    const detail = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    expect(detail.status).toBe(200)
    expect(detail.body.data.devices).toHaveLength(0)
  })
})
