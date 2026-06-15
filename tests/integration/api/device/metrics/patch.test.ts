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

describe("PATCH /api/devices/:code/metrics", () => {
  describe("Anonymous user", () => {
    test("should update device metrics without authentication", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      expect(response.status).toBe(204)
    })
  })

  describe("Validation", () => {
    test("should return 404 when device code does not exist", async () => {
      const response = await request(app)
        .patch("/api/devices/INVALID999/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBe("Device not found")
    })

    test("should return 400 when localization is missing", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })

    test("should return 400 when lat or lng are missing", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054 } })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Persistence", () => {
    test("should persist metrics on device", async () => {
      const token = await loginAndGetToken()
      const createResponse = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const device = createResponse.body.data

      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(getResponse.body.data.metrics).toMatchObject({
        localization: {
          lat: -23.3054,
          lng: -45.9631,
        },
      })
    })

    test("should stamp updatedAt timestamp on metrics", async () => {
      const token = await loginAndGetToken()
      const createResponse = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const device = createResponse.body.data

      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      const { updatedAt } = getResponse.body.data.metrics
      expect(typeof updatedAt).toBe("string")
      expect(Number.isNaN(Date.parse(updatedAt))).toBe(false)
    })
  })
})
