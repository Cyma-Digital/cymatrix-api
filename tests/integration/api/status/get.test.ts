import request from "supertest"
import app from "@/app"
import { loginAndGetToken } from "tests/helpers/auth"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/status", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/status")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    test("should retrieve current system status", async () => {
      const token = await loginAndGetToken()

      const response = await request(app)
        .get("/api/status")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBeDefined()
      expect(response.body.database).toBeDefined()
      expect(response.body.updated_at).toBeDefined()
    })
  })
})
