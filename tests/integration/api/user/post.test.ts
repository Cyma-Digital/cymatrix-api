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

      test("should create FINANCE user", async () => {
        const token = await loginAndGetToken()
        const payload = {
          firstName: "Fábio",
          lastName: "Nogueira",
          email: "fabio_nogueira63@hotmail.com",
          password: "Test@123",
          role: "FINANCE",
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
        expect(response.body.data.role).toBe("FINANCE")
        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()
      })

      test("should create PRODUCTION user", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send({
            firstName: "Carla",
            lastName: "Oliveira",
            email: "carla.oliveira@gmail.com",
            password: "Test@123",
            role: "PRODUCTION",
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("PRODUCTION")
      })

      test("should create INSTALLATION user", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send({
            firstName: "Rafael",
            lastName: "Silva",
            email: "rafael.silva@gmail.com",
            phone: "(11) 99876-5432",
            password: "Test@123",
            role: "INSTALLATION",
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("INSTALLATION")
      })

      test("should create LOGISTICS user", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send({
            firstName: "Juliana",
            lastName: "Costa",
            email: "juliana.costa@gmail.com",
            password: "Test@123",
            role: "LOGISTICS",
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("LOGISTICS")
      })

      test("should create PROGRAMMING user", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send({
            firstName: "Lucas",
            lastName: "Pereira",
            email: "lucas.pereira@gmail.com",
            password: "Test@123",
            role: "PROGRAMMING",
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("PROGRAMMING")
      })
    })
  })
})
