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

async function addDevice(authToken: string, groupId: number, deviceId: number) {
  await request(app)
    .post(`/api/groups/${groupId}/devices`)
    .set("Authorization", `Bearer ${authToken}`)
    .send({ deviceIds: [deviceId] })
}

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/groups/:id/devices/:deviceId", () => {
  test("should return 401 without authentication", async () => {
    const response = await request(app).delete("/api/groups/1/devices/1")
    expect(response.status).toBe(401)
  })

  test("should remove the device from the group", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")
    await addDevice(client.token, groupId, deviceId)

    const response = await request(app)
      .delete(`/api/groups/${groupId}/devices/${deviceId}`)
      .set("Authorization", `Bearer ${client.token}`)

    expect(response.status).toBe(204)

    const detail = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${client.token}`)
    expect(detail.body.data.devices).toHaveLength(0)
  })

  test("should return 404 when the device is not a member", async () => {
    const client = await createClientAndLogin("client@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")

    const response = await request(app)
      .delete(`/api/groups/${groupId}/devices/${deviceId}`)
      .set("Authorization", `Bearer ${client.token}`)

    expect(response.status).toBe(404)
  })

  test("should return 403 when a CLIENT manages another user's group; ADMIN succeeds", async () => {
    const client = await createClientAndLogin("client@test.com")
    const other = await createClientAndLogin("other@test.com")
    const deviceId = await createDevice("DEV001", client.userId)
    const groupId = await createGroup(client.token, "Loja Centro")
    await addDevice(client.token, groupId, deviceId)

    const otherAttempt = await request(app)
      .delete(`/api/groups/${groupId}/devices/${deviceId}`)
      .set("Authorization", `Bearer ${other.token}`)
    expect(otherAttempt.status).toBe(403)

    const adminAttempt = await request(app)
      .delete(`/api/groups/${groupId}/devices/${deviceId}`)
      .set("Authorization", `Bearer ${token}`)
    expect(adminAttempt.status).toBe(204)
  })

  test("should return 404 when group does not exist", async () => {
    const response = await request(app)
      .delete("/api/groups/99999/devices/1")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(404)
  })
})
