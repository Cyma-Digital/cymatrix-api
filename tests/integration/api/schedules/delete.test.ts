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
