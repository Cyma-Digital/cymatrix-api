import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { getCookie } from "tests/helpers/auth"
import { usersMocked } from "tests/mocks/users"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/auth/refresh", () => {
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test.skip("should refresh access token with valid refresh cookie", async () => {
        await request(app).post("/api/users").send(usersMocked.admin)

        const loginResponse = await request(app).post("/api/auth/login").send({
          email: usersMocked.admin.email,
          password: usersMocked.admin.password,
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const originalAccessToken = loginResponse.body.data.access

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const refreshCookie = getCookie(loginResponse, "refreshToken")
      })
    })
  })
})
