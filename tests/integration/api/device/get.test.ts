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

describe("GET /api/devices", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/devices")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    test("should list all devices", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Padaria Bom Pão", code: "PAD001" })

      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Açougue Central", code: "ACG001" })

      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Restaurante Sabor", code: "RST001" })

      const response = await request(app)
        .get("/api/devices")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body.data).toHaveLength(3)
    })
  })
})

describe("GET /api/devices/:id", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/devices/1")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    test("should return device by id", async () => {
      const token = await loginAndGetToken()

      const createResponse = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Padaria Bom Pão - Vitrine",
          code: "PAD001",
          address: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567",
        })

      const device = createResponse.body.data

      const response = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: device.id,
        name: "Padaria Bom Pão - Vitrine",
        code: "PAD001",
        city: "São Paulo",
        state: "SP",
      })
    })

    test("should return 404 when device does not exist", async () => {
      const token = await loginAndGetToken()

      const response = await request(app)
        .get("/api/devices/99999")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBe("Device not found")
    })
  })
})
