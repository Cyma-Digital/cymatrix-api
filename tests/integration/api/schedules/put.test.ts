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

describe("PUT /api/schedules/:id with group target", () => {
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

  test("should update a group schedule for the group owner", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const scheduleId = await createGroupSchedule(clientToken)

    const response = await request(app)
      .put(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ customFields: { text: "Atualizado" } })

    expect(response.status).toBe(200)
    expect(response.body.data.customFields).toMatchObject({
      text: "Atualizado",
    })
  })

  test("should return 403 for a CLIENT that does not own the group; ADMIN succeeds", async () => {
    const clientToken = await createClientAndLogin("client@test.com")
    const otherToken = await createClientAndLogin("other@test.com")
    const scheduleId = await createGroupSchedule(clientToken)

    const otherAttempt = await request(app)
      .put(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ customFields: { text: "Invasão" } })
    expect(otherAttempt.status).toBe(403)

    const adminAttempt = await request(app)
      .put(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ customFields: { text: "Suporte" } })
    expect(adminAttempt.status).toBe(200)
  })
})

describe("PUT /api/schedules/:id", () => {
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should update content schedule", async () => {
        const createRes = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Original" },
            weekdays: [1, 2, 3],
          })
        const { id } = createRes.body.data

        const response = await request(app)
          .put(`/api/schedules/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            customFields: { text: "Updated" },
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            startTime: "09:00",
            endTime: "21:00",
            active: false,
          })

        expect(response.status).toBe(200)
        expect(response.body.data.customFields).toMatchObject({
          text: "Updated",
        })
        expect(response.body.data.startTime).toBe("09:00")
        expect(response.body.data.active).toBe(false)
      })
    })

    describe("Error cases", () => {
      test("should return 404 when not found", async () => {
        const response = await request(app)
          .put("/api/schedules/99999")
          .set("Authorization", `Bearer ${token}`)
          .send({ customFields: { text: "Test" } })

        expect(response.status).toBe(404)
      })

      test("should return 404 when template does not exist", async () => {
        const createRes = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Test" },
            weekdays: [1],
          })
        const { id } = createRes.body.data

        const response = await request(app)
          .put(`/api/schedules/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ templateId: 99999 })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Template not found")
      })
    })
  })
})
