import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string
let clientToken: string
let clientId: number
let deviceId: number
let groupId: number
let templateId: number

const allWeekdays = [0, 1, 2, 3, 4, 5, 6]

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

async function getGroupDevices() {
  const response = await request(app)
    .get(`/api/groups/${groupId}`)
    .set("Authorization", `Bearer ${clientToken}`)
  return response.body.data.devices as Array<{ id: number }>
}

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()

  const client = await createClientAndLogin("client@test.com")
  clientToken = client.token
  clientId = client.userId

  const deviceRes = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Device A", code: "DEV001" })
  deviceId = deviceRes.body.data.id

  await request(app)
    .patch(`/api/devices/${deviceId}/owner`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ownerId: clientId })

  const groupRes = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ name: "Loja Centro" })
  groupId = groupRes.body.data.id

  await request(app)
    .post(`/api/groups/${groupId}/devices`)
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ deviceIds: [deviceId] })

  const templateRes = await request(app)
    .post("/api/templates")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Texto rolando",
      preset: { on: true, text: "default" },
      editableFields: [{ key: "text", label: "Texto", path: "text" }],
    })
  templateId = templateRes.body.data.id
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/devices/:id/owner group membership cleanup", () => {
  test("reassigning the owner removes memberships in the previous owner's groups", async () => {
    const newOwner = await createClientAndLogin("newowner@test.com")

    const response = await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId: newOwner.userId })

    expect(response.status).toBe(200)
    expect(await getGroupDevices()).toHaveLength(0)
  })

  test("removing the owner (null) removes memberships in the previous owner's groups", async () => {
    const response = await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId: null })

    expect(response.status).toBe(200)
    expect(await getGroupDevices()).toHaveLength(0)
  })

  test("reassigning to the same owner keeps memberships", async () => {
    const response = await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId: clientId })

    expect(response.status).toBe(200)
    expect(await getGroupDevices()).toHaveLength(1)
  })

  test("group schedules no longer resolve for the device after reassignment", async () => {
    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        groupId,
        templateId,
        customFields: { text: "Conteúdo do grupo" },
        weekdays: allWeekdays,
      })

    const before = await request(app).get("/api/devices/DEV001/data")
    expect(before.body.data).toHaveLength(1)

    const newOwner = await createClientAndLogin("newowner@test.com")
    await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId: newOwner.userId })

    const after = await request(app).get("/api/devices/DEV001/data")
    expect(after.body.data).toHaveLength(0)
  })
})
