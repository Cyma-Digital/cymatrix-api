import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string
let clientToken: string
let clientId: number
let deviceId: number
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

async function createGroup(name: string) {
  const response = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ name })
  return response.body.data.id as number
}

async function addDeviceToGroup(groupId: number, targetDeviceId = deviceId) {
  await request(app)
    .post(`/api/groups/${groupId}/devices`)
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ deviceIds: [targetDeviceId] })
}

async function createGroupSchedule(groupId: number, text: string) {
  const response = await request(app)
    .post("/api/schedules")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({
      groupId,
      templateId,
      customFields: { text },
      weekdays: allWeekdays,
    })
  return response.body.data.id as number
}

async function getContent() {
  const response = await request(app).get("/api/devices/DEV001/data")
  expect(response.status).toBe(200)
  return response.body.data as Array<{
    id: number
    preset: Record<string, unknown>
  }>
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

describe("GET /api/devices/:code/data with group schedules", () => {
  test("should serve the group schedule content to a device in the group", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)

    const content = await getContent()

    expect(content).toHaveLength(1)
    expect(content[0]?.preset.text).toBe("Conteúdo do grupo")
  })

  test("should serve both direct and group schedule content", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Via grupo")
    await addDeviceToGroup(groupId)

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        deviceId,
        templateId,
        customFields: { text: "Direto" },
        weekdays: allWeekdays,
      })

    const content = await getContent()

    expect(content).toHaveLength(2)
    const texts = content.map((item) => item.preset.text)
    expect(texts).toContain("Via grupo")
    expect(texts).toContain("Direto")
  })

  test("should serve content from two groups the device belongs to", async () => {
    const groupA = await createGroup("Loja Centro")
    const groupB = await createGroup("Campanha Natal")
    await createGroupSchedule(groupA, "Grupo A")
    await createGroupSchedule(groupB, "Grupo B")
    await addDeviceToGroup(groupA)
    await addDeviceToGroup(groupB)

    const content = await getContent()

    expect(content).toHaveLength(2)
    const texts = content.map((item) => item.preset.text)
    expect(texts).toContain("Grupo A")
    expect(texts).toContain("Grupo B")
  })

  test("should stop serving group content after the device is removed from the group", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)

    await request(app)
      .delete(`/api/groups/${groupId}/devices/${deviceId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    const content = await getContent()

    expect(content).toHaveLength(0)
  })

  test("should stop serving group content after the group is soft-deleted", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)

    await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    const content = await getContent()

    expect(content).toHaveLength(0)
  })

  test("should not serve group schedules outside their weekdays", async () => {
    const groupId = await createGroup("Loja Centro")
    await addDeviceToGroup(groupId)

    const today = new Date().getDay()
    const notToday = allWeekdays.filter((weekday) => weekday !== today)

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        groupId,
        templateId,
        customFields: { text: "Fora do dia" },
        weekdays: notToday,
      })

    const content = await getContent()

    expect(content).toHaveLength(0)
  })

  test("should apply locked deviceOverrides to group schedule content", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Original")
    await addDeviceToGroup(groupId)

    await request(app)
      .patch(`/api/devices/${deviceId}/overrides`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        deviceOverrides: {
          text: { path: "text", value: "Sobrescrito", lock: true },
        },
      })

    const content = await getContent()

    expect(content).toHaveLength(1)
    expect(content[0]?.preset.text).toBe("Sobrescrito")
  })
})
