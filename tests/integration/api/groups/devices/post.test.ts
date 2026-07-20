import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string

async function createClientAndLogin(email: string) {
  const userRes = await request(app)
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

  return {
    userId: userRes.body.data.id as number,
    token: login.body.data.access as string,
  }
}

async function createDevice(code: string, ownerId?: number) {
  const deviceRes = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: `Device ${code}`, code })
  const deviceId = deviceRes.body.data.id as number

  if (ownerId) {
    await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId })
  }

  return deviceId
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

describe("POST /api/groups/:id/devices", () => {
  test("should return 401 without authentication", async () => {
    const response = await request(app)
      .post("/api/groups/1/devices")
      .send({ deviceIds: [1] })

    expect(response.status).toBe(401)
  })

  test("should add the owner's device to the group", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    const response = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })

    expect(response.status).toBe(201)
    expect(response.body.data.devices).toHaveLength(1)
    expect(response.body.data.devices[0].id).toBe(deviceId)
  })

  test("should add multiple devices in a single call", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceA = await createDevice("DEV001", client.userId)
    const deviceB = await createDevice("DEV002", client.userId)
    const deviceC = await createDevice("DEV003", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    const response = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceA, deviceB, deviceC] })

    expect(response.status).toBe(201)
    expect(response.body.data.devices).toHaveLength(3)

    const detail = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${client.token}`)
    expect(detail.body.data.devices).toHaveLength(3)
  })

  test("should reject the whole batch and add nothing when one device is invalid", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    const response = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId, 99999] })

    expect(response.status).toBe(404)

    const detail = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${client.token}`)
    expect(detail.body.data.devices).toHaveLength(0)
  })

  test("should return 400 when deviceIds is empty", async () => {
    const client = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(client.token, "Loja Centro")

    const response = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [] })

    expect(response.status).toBe(400)
  })

  test("should return 403 when the device belongs to another user, even for ADMIN", async () => {
    const client = await createClientAndLogin("client@test.com")
    const other = await createClientAndLogin("other@test.com")
    const deviceId = await createDevice("DEV001", other.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    const clientAttempt = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })
    expect(clientAttempt.status).toBe(403)

    const adminAttempt = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${token}`)
      .send({ deviceIds: [deviceId] })
    expect(adminAttempt.status).toBe(403)
  })

  test("should return 409 for duplicate membership", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })

    const response = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })

    expect(response.status).toBe(409)
  })

  test("should allow the same device in two groups of the same owner", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupA = await createGroup(client.token, "Loja Centro")
    const groupB = await createGroup(client.token, "Campanha Natal")

    const responseA = await request(app)
      .post(`/api/groups/${groupA}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })
    const responseB = await request(app)
      .post(`/api/groups/${groupB}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })

    expect(responseA.status).toBe(201)
    expect(responseB.status).toBe(201)
  })

  test("should return 403 when a CLIENT manages another user's group; ADMIN succeeds", async () => {
    const client = await createClientAndLogin("client@test.com")
    const other = await createClientAndLogin("other@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    const otherAttempt = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ deviceIds: [deviceId] })
    expect(otherAttempt.status).toBe(403)

    const adminAttempt = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${token}`)
      .send({ deviceIds: [deviceId] })
    expect(adminAttempt.status).toBe(201)
  })

  test("should return 404 when group does not exist", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)

    const response = await request(app)
      .post("/api/groups/99999/devices")
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [deviceId] })

    expect(response.status).toBe(404)
  })

  test("should return 404 when device does not exist", async () => {
    const client = await createClientAndLogin("client@test.com")
    const groupId = await createGroup(client.token, "Loja Centro")

    const response = await request(app)
      .post(`/api/groups/${groupId}/devices`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ deviceIds: [99999] })

    expect(response.status).toBe(404)
  })
})
