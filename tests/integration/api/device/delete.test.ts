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

describe("DELETE /api/devices/:id", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).delete("/api/devices/1")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should soft delete a device", async () => {
        const token = await loginAndGetToken()

        const createResponse = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Device para deletar", code: "DEL001" })
        const { id } = createResponse.body.data

        const deleteResponse = await request(app)
          .delete(`/api/devices/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(deleteResponse.status).toBe(204)

        const getResponse = await request(app)
          .get(`/api/devices/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(getResponse.status).toBe(404)
      })

      test("should not list deleted device", async () => {
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

        await request(app)
          .delete(`/api/devices/${id}`)
          .set("Authorization", `Bearer ${token}`)

        const listResponse = await request(app)
          .get("/api/devices")
          .set("Authorization", `Bearer ${token}`)

        expect(listResponse.body.data).toHaveLength(1)
        expect(listResponse.body.data[0].code).toBe("DEV001")
      })
    })

    describe("Error cases", () => {
      test("should return 404 when device does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .delete("/api/devices/99999")
          .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Device not found")
      })

      test("should return 400 when ID format is invalid", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .delete("/api/devices/invalid-id")
          .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })
    })
  })
})
