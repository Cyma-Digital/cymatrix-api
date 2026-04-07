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
      preset: { on: true, bri: 200 },
      editableFields: [{ key: "text", label: "Texto", type: "text" }],
    })
  templateId = templateRes.body.data.id
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/schedules", () => {
  describe("Authenticated user", () => {
    test("should list all content schedules", async () => {
      await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Schedule A" },
          weekdays: [1, 2, 3],
        })

      await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Schedule B" },
          weekdays: [4, 5],
        })

      const response = await request(app)
        .get("/api/schedules")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })
  })
})

describe("GET /api/schedules/:id", () => {
  describe("Authenticated user", () => {
    test("should return content schedule by id", async () => {
      const createRes = await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Hello" },
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          startTime: "08:00",
          endTime: "18:00",
        })
      const { id } = createRes.body.data

      const response = await request(app)
        .get(`/api/schedules/${id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id,
        deviceId,
        templateId,
        startTime: "08:00",
        endTime: "18:00",
      })
      expect(response.body.data.template).toBeDefined()
      expect(response.body.data.device).toBeDefined()
    })

    test("should return 404 when not found", async () => {
      const response = await request(app)
        .get("/api/schedules/99999")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
    })
  })
})

describe("GET /api/schedules/device/:id", () => {
  describe("Authenticated user", () => {
    test("should list schedules by device", async () => {
      await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Only for this device" },
          weekdays: [1],
        })

      const response = await request(app)
        .get(`/api/schedules/device/${deviceId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })
  })
})
