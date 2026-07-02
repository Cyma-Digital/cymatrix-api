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

async function createSchedule(token: string, name: string) {
  const deviceResponse = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, code: `DEV-${Date.now()}-${Math.random()}` })

  const templateResponse = await request(app)
    .post("/api/templates")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, preset: { on: true }, editableFields: [] })

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

describe("GET /api/schedule-effect", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/schedule-effect")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    test("should list all scheduleEffects", async () => {
      const token = await loginAndGetToken()

      const scheduleAId = await createSchedule(token, "Schedule A")
      const scheduleBId = await createSchedule(token, "Schedule B")

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleAId, effectId: 1 })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleAId, effectId: 2 })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleBId, effectId: 1 })

      const response = await request(app)
        .get("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
      expect(response.body.data).toHaveLength(3)
    })

    test("should get scheduleEffect by id", async () => {
      const token = await loginAndGetToken()

      const scheduleId = await createSchedule(token, "Schedule A")

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      const scheduleEffectCreatedResponse = await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId, effectId: 1 })

      const scheduleEffect = scheduleEffectCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/schedule-effect/${scheduleEffect.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toMatchObject({
        id: expect.any(Number),
        scheduleId,
        effectId: 1,
      })
    })

    test("should get scheduleEffect by schedule id", async () => {
      const token = await loginAndGetToken()

      const scheduleAId = await createSchedule(token, "Schedule A")
      const scheduleBId = await createSchedule(token, "Schedule B")

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleBId, effectId: 1 })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleAId, effectId: 1 })

      const scheduleEffectCreatedResponse = await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleAId, effectId: 2 })
      const scheduleEffect = scheduleEffectCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/schedule-effect/schedule/${scheduleEffect.scheduleId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toHaveLength(2)
    })

    test("should get scheduleEffect by effect id", async () => {
      const token = await loginAndGetToken()

      const scheduleAId = await createSchedule(token, "Schedule A")
      const scheduleBId = await createSchedule(token, "Schedule B")

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleAId, effectId: 2 })

      await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleBId, effectId: 1 })

      const scheduleEffectCreatedResponse = await request(app)
        .post("/api/schedule-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ scheduleId: scheduleAId, effectId: 1 })

      const scheduleEffect = scheduleEffectCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/schedule-effect/effect/${scheduleEffect.effectId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toHaveLength(2)
    })
  })
})
