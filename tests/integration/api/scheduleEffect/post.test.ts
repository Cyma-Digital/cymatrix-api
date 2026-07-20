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

describe("POST /api/schedule-effect/", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const payload = {
        scheduleId: 1,
        effectId: 1,
      }

      const response = await request(app)
        .post("/api/schedule-effect")
        .send(payload)

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create scheduleEffect", async () => {
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

        const payload = {
          scheduleId,
          effectId: 1,
        }

        const response = await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          scheduleId: payload.scheduleId,
          effectId: payload.effectId,
        })
      })

      test("should create scheduleEffect for a group-targeted schedule", async () => {
        const token = await loginAndGetToken()

        const groupResponse = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Grupo A" })

        const templateResponse = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template A",
            preset: { on: true },
            editableFields: [],
          })

        const scheduleResponse = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            groupId: groupResponse.body.data.id,
            templateId: templateResponse.body.data.id,
            customFields: {},
            weekdays: [1, 2, 3, 4, 5],
          })

        const effectResponse = await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect A",
            preset: { on: true },
            editableFields: [],
          })

        const response = await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send({
            scheduleId: scheduleResponse.body.data.id,
            effectId: effectResponse.body.data.id,
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
      })
    })

    describe("Error cases", () => {
      test("should return 404 when schedule not found", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect A",
            preset: { on: true },
            editableFields: [],
          })

        const payload = {
          scheduleId: 99999,
          effectId: 1,
        }

        const response = await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Schedule not found")
      })

      test("should return 404 when effect not found", async () => {
        const token = await loginAndGetToken()

        const scheduleId = await createSchedule(token)

        const payload = {
          scheduleId,
          effectId: 99999,
        }

        const response = await request(app)
          .post("/api/schedule-effect")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Effect not found")
      })
    })
  })
})
