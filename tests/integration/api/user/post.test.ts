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

describe("POST /api/users", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const payload = {
        firstName: "Alessandro",
        lastName: "Santos",
        email: "alessandro_santos@gmail.com",
        password: "Test@123",
        role: "ADMIN",
      }

      const response = await request(app).post("/api/users").send(payload)

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create ADMIN user", async () => {
        const token = await loginAndGetToken()
        const payload = {
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        }

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
        })
        expect(response.body.data.role).toBe("ADMIN")
        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()
      })

      test("should create STAFF user", async () => {
        const token = await loginAndGetToken()
        const payload = {
          firstName: "Emanuelly",
          lastName: "Martins",
          email: "emanuelly.martins29@bol.com.br",
          phone: "(97) 83440-8270",
          password: "Test@123",
          role: "STAFF",
        }

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          firstName: "Emanuelly",
          lastName: "Martins",
          email: "emanuelly.martins29@bol.com.br",
        })
        expect(response.body.data.role).toBe("STAFF")
        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()
      })

      test("should create CLIENT user", async () => {
        const token = await loginAndGetToken()
        const payload = {
          firstName: "Fábio",
          lastName: "Nogueira",
          email: "fabio_nogueira63@hotmail.com",
          password: "Test@123",
          role: "CLIENT",
        }

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          firstName: "Fábio",
          lastName: "Nogueira",
          email: "fabio_nogueira63@hotmail.com",
        })
        expect(response.body.data.role).toBe("CLIENT")
        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()
      })
    })
  })
})
