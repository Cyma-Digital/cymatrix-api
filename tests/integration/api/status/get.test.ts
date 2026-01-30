import request from "supertest"
import app from "../../../../src/app"

describe("GET /api/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await request(app).get("/api/status")

      expect(response.status).toBe(200)
      expect(response.body.status).toBeDefined()
      expect(response.body.database).toBeDefined()
      expect(response.body.updated_at).toBeDefined()
    })
  })
})
