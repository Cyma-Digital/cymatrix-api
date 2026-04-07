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
