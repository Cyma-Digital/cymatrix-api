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

describe("PUT /api/devices/:id", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .put("/api/devices/1")
        .send({ name: "Test" })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should update a device", async () => {
        const token = await loginAndGetToken()

        const createResponse = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Padaria Bom Pão",
            code: "PAD001",
            city: "São Paulo",
            state: "SP",
          })
        const { id } = createResponse.body.data

        const updatePayload = {
          name: "Padaria Bom Pão - Atualizado",
          code: "PAD002",
          address: "Rua Nova, 456",
          city: "Campinas",
          state: "SP",
          zipCode: "13015-100",
        }

        const response = await request(app)
          .put(`/api/devices/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(updatePayload)

        expect(response.status).toBe(200)
        expect(response.body.data).toMatchObject({
          id: id,
          name: updatePayload.name,
          code: updatePayload.code,
          address: updatePayload.address,
          city: updatePayload.city,
          state: updatePayload.state,
          zipCode: updatePayload.zipCode,
        })
      })
    })

    describe("Error cases", () => {
      test("should return 400 when ID format is invalid", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .put("/api/devices/invalid-id")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Test", code: "TST001" })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Validation failed")
        expect(response.body.details.fieldErrors.id).toBeDefined()
      })

      test("should return 404 when device ID does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .put("/api/devices/99999")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Test", code: "TST001" })

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Device not found")
      })

      test("should return 409 when updating to existing code", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Device A", code: "DEV001" })

        const createResponse = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Device B", code: "DEV002" })
        const { id } = createResponse.body.data

        const response = await request(app)
          .put(`/api/devices/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Device B", code: "DEV001" })

        expect(response.status).toBe(409)
        expect(response.body.status).toBe("error")
      })
    })
  })
})
