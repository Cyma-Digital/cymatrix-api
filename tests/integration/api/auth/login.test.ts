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
          email: "admin@test.com",
          role: "ADMIN",
        }
        const response = await request(app).post("/api/auth/login").send({
          email: "admin@test.com",
          password: "admin123",
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

    describe("Error cases", () => {
      test("should return 401 with wrong password", async () => {
        const response = await request(app).post("/api/auth/login").send({
          email: "admin@test.com",
          password: "wrongpassword",
        })

        expect(response.status).toBe(401)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Invalid credentials")
      })

      test("should return 401 with non-existent email", async () => {
        const response = await request(app).post("/api/auth/login").send({
          email: "nonexistent@test.com",
          password: "admin123",
        })

        expect(response.status).toBe(401)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Invalid credentials")
      })

      test("should return same error message for wrong email and wrong password", async () => {
        const wrongEmail = await request(app).post("/api/auth/login").send({
          email: "nonexistent@test.com",
          password: "admin123",
        })

        const wrongPassword = await request(app).post("/api/auth/login").send({
          email: "admin@test.com",
          password: "wrongpassword",
        })

        expect(wrongEmail.body.message).toBe(wrongPassword.body.message)
      })

      test("should return 400 with missing email", async () => {
        const response = await request(app).post("/api/auth/login").send({
          password: "admin123",
        })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })

      test("should return 400 with missing password", async () => {
        const response = await request(app).post("/api/auth/login").send({
          email: "admin@test.com",
        })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })
    })
  })
})
