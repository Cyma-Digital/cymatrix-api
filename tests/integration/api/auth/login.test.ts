import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { getCookie } from "tests/helpers/auth"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/auth/login", () => {
  describe("Anonymous user", () => {
    describe("Success case", () => {
      test("should authenticate with valid credential and return accessToken", async () => {
        const payload = {
          firstName: "Admin",
          lastName: "User",
          email: "admin@mail.com",
          phone: "(12) 9999-9999",
          password: "admin@password",
          role: "ADMIN",
        }

        await request(app).post("/api/users").send(payload)

        const response = await request(app).post("/api/auth/login").send({
          email: payload.email,
          password: payload.password,
        })

        const refreshCookie = getCookie(response, "refreshToken")

        expect(response.status).toBe(200)
        expect(response.body.status).toBe("success")

        expect(response.body.data).toBeDefined()
        expect(response.body.data.access).toBeDefined()
        expect(response.body.data.user).toBeDefined()
        expect(response.body.data.user).toMatchObject({
          id: expect.any(Number),
          name: `${payload.firstName} ${payload.lastName}`,
          email: payload.email,
          role: payload.role,
        })

        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()

        expect(refreshCookie).toBeDefined()
        expect(refreshCookie.toLowerCase()).toContain("httponly")
        expect(refreshCookie.toLowerCase()).toContain("samesite=strict")
      })
    })
  })
})
