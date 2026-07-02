import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

async function createSchedule(token: string) {
  const deviceResponse = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Device A", code: `DEV-${Date.now()}-${Math.random()}` })

  const templateResponse = await request(app)
    .post("/api/templates")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Template A", preset: { on: true }, editableFields: [] })

  const scheduleResponse = await request(app)
    .post("/api/schedules")
    .set("Authorization", `Bearer ${token}`)
    .send({
      deviceId: deviceResponse.body.data.id,
      templateId: templateResponse.body.data.id,
      customFields: {},
      weekdays: [1, 2, 3, 4, 5],
    })

  return scheduleResponse.body.data.id as number
}

describe("DELETE /api/schedule-effect/:id", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const token = await loginAndGetToken()

      const scheduleId = await createSchedule(token)

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Effect A",
          preset: { on: true },
          editableFields: [],
        })

      const createResponse = await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId, effectId: 1 })

      const { id } = createResponse.body.data

      const deleteResponse = await request(app).delete(
        `/api/schedule-effect/${id}`,
      )

      expect(deleteResponse.status).toBe(401)
      expect(deleteResponse.body.status).toBe("error")
    })
  })
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should delete a scheduleEffect", async () => {
        const token = await loginAndGetToken()

        const scheduleId = await createSchedule(token)

        await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect A",
            preset: { on: true },
            editableFields: [],
          })

        const createResponse = await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send({ scheduleId, effectId: 1 })

        const { id } = createResponse.body.data

        const deleteResponse = await request(app)
          .delete(`/api/schedule-effect/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(deleteResponse.status).toBe(204)

        const getResponse = await request(app)
          .get(`/api/schedule-effect/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(getResponse.status).toBe(404)
      })

      test("should not list deleted scheduleEffects", async () => {
        const token = await loginAndGetToken()

        const scheduleId = await createSchedule(token)

        await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect A",
            preset: { on: true },
            editableFields: [],
          })

        await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect B",
            preset: { on: true },
            editableFields: [],
          })

        await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send({ scheduleId, effectId: 1 })

        const createResponse = await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send({ scheduleId, effectId: 2 })

        const { id } = createResponse.body.data

        await request(app)
          .delete(`/api/schedule-effect/${id}`)
          .set("Authorization", `Bearer ${token}`)

        const listResponse = await request(app)
          .get("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)

        expect(listResponse.body.data).toHaveLength(1)
        expect(listResponse.body.data[0].effectId).toBe(1)
      })
    })

    describe("Error cases", () => {
      test("should return 404 when scheduleEffect does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .delete("/api/schedule-effect/99999")
          .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Schedule effect not found")
      })
    })
  })
})
