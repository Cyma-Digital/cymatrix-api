import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string
let deviceId: number
let templateId: number

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()

  const deviceRes = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Device A", code: "DEV001" })
  deviceId = deviceRes.body.data.id

  const templateRes = await request(app)
    .post("/api/templates")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Texto rolando",
      preset: { on: true },
      editableFields: [],
    })
  templateId = templateRes.body.data.id
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/schedules/:id with group target", () => {
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

  async function createGroupSchedule(authToken: string) {
    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Grupo do cliente" })

    const scheduleRes = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        groupId: groupRes.body.data.id,
        templateId,
        customFields: { text: "Grupo" },
        weekdays: [1],
      })

    return scheduleRes.body.data.id as number
  }

  test("should soft delete a group schedule for the group owner", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const scheduleId = await createGroupSchedule(clientToken)

    const response = await request(app)
      .delete(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    expect(response.status).toBe(204)

    const getRes = await request(app)
      .get(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${clientToken}`)
    expect(getRes.status).toBe(404)
  })

  test("should return 403 for a CLIENT that does not own the group", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")
    const scheduleId = await createGroupSchedule(clientToken)

    const response = await request(app)
      .delete(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${otherToken}`)

    expect(response.status).toBe(403)
  })
})

describe("DELETE /api/schedules/:id", () => {
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should soft delete a content schedule", async () => {
        const createRes = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Delete me" },
            weekdays: [1],
          })
        const { id } = createRes.body.data

        const deleteRes = await request(app)
          .delete(`/api/schedules/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(deleteRes.status).toBe(204)

        const getRes = await request(app)
          .get(`/api/schedules/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(getRes.status).toBe(404)
      })

      test("should not list deleted schedule", async () => {
        await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Keep" },
            weekdays: [1],
          })

        const createRes = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Delete" },
            weekdays: [2],
          })
        const { id } = createRes.body.data

        await request(app)
          .delete(`/api/schedules/${id}`)
          .set("Authorization", `Bearer ${token}`)

        const listRes = await request(app)
          .get("/api/schedules")
          .set("Authorization", `Bearer ${token}`)

        expect(listRes.body.data).toHaveLength(1)
      })
    })

    describe("Error cases", () => {
      test("should return 404 when not found", async () => {
        const response = await request(app)
          .delete("/api/schedules/99999")
          .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
      })
    })
  })
})
