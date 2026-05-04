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
      preset: { on: true, bri: 200, seg: [{ fx: 78 }] },
      editableFields: [{ key: "text", label: "Texto", type: "text" }],
    })
  templateId = templateRes.body.data.id
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/schedules", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/schedules")
        .send({
          deviceId: 1,
          templateId: 1,
          customFields: { text: "Hello" },
          weekdays: [0, 1, 2, 3, 4, 5, 6],
        })

      expect(response.status).toBe(401)
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create content schedule with all fields", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Promoção do dia!", color: "#FF0000" },
            weekdays: [1, 2, 3, 4, 5],
            startTime: "08:00",
            endTime: "22:00",
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          deviceId,
          templateId,
          active: true,
        })
        expect(response.body.data.customFields).toMatchObject({
          text: "Promoção do dia!",
          color: "#FF0000",
        })
        expect(response.body.data.template).toBeDefined()
      })

      test("should create content schedule without time constraints", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Sempre ativo" },
            weekdays: [0, 1, 2, 3, 4, 5, 6],
          })

        expect(response.status).toBe(201)
        expect(response.body.data.startTime).toBeNull()
        expect(response.body.data.endTime).toBeNull()
      })

      test("should create content schedule with durationSec", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Com duração" },
            weekdays: [1, 2, 3, 4, 5],
            durationSec: 30,
          })

        expect(response.status).toBe(201)
        expect(response.body.data.durationSec).toBe(30)
      })

      test("should create content schedule with durationSec as null", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Sem duração" },
            weekdays: [1, 2, 3, 4, 5],
            durationSec: null,
          })

        expect(response.status).toBe(201)
        expect(response.body.data.durationSec).toBeNull()
      })
    })

    describe("Error cases", () => {
      test("should return 404 when device does not exist", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId: 99999,
            templateId,
            customFields: { text: "Hello" },
            weekdays: [0],
          })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Device not found")
      })

      test("should return 404 when template does not exist", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId: 99999,
            customFields: { text: "Hello" },
            weekdays: [0],
          })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Template not found")
      })

      test("should return 400 when weekdays is missing", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Hello" },
          })

        expect(response.status).toBe(400)
      })

      test("should return 400 when durationSec is not a positive integer", async () => {
        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Hello" },
            weekdays: [0],
            durationSec: -5,
          })

        expect(response.status).toBe(400)
      })

      test("should return 403 when schedules reached limit", async () => {
        await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Schedule A" },
            weekdays: [1],
          })

        await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Schedule B" },
            weekdays: [2],
          })

        await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Schedule C" },
            weekdays: [3],
          })

        await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Schedule D" },
            weekdays: [4],
          })

        const response = await request(app)
          .post("/api/schedules")
          .set("Authorization", `Bearer ${token}`)
          .send({
            deviceId,
            templateId,
            customFields: { text: "Schedule E" },
            weekdays: [6],
          })

        expect(response.status).toBe(403)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Schedules limit reached")
      })
    })
  })
})
