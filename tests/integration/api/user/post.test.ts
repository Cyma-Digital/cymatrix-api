import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/users", () => {
  describe("Anonymous user", () => {
    describe("Success cases", () => {
      test("should create ADMIN user", async () => {
        const payload = {
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        }

        const response = await request(app).post("/api/users").send(payload)

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
        const payload = {
          firstName: "Emanuelly",
          lastName: "Martins",
          email: "emanuelly.martins29@bol.com.br",
          phone: "(97) 83440-8270",
          password: "Test@123",
          role: "STAFF",
        }

        const response = await request(app).post("/api/users").send(payload)

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
        const payload = {
          firstName: "Fábio",
          lastName: "Nogueira",
          email: "fabio_nogueira63@hotmail.com",
          password: "Test@123",
          role: "FINANCE",
        }

        const response = await request(app).post("/api/users").send(payload)

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
        const payload = {
          firstName: "Carla",
          lastName: "Oliveira",
          email: "carla.oliveira@gmail.com",
          password: "Test@123",
          role: "PRODUCTION",
        }

        const response = await request(app).post("/api/users").send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("PRODUCTION")
      })

      test("should create INSTALLATION user", async () => {
        const payload = {
          firstName: "Rafael",
          lastName: "Silva",
          email: "rafael.silva@gmail.com",
          phone: "(11) 99876-5432",
          password: "Test@123",
          role: "INSTALLATION",
        }

        const response = await request(app).post("/api/users").send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("INSTALLATION")
      })

      test("should create LOGISTICS user", async () => {
        const payload = {
          firstName: "Juliana",
          lastName: "Costa",
          email: "juliana.costa@gmail.com",
          password: "Test@123",
          role: "LOGISTICS",
        }

        const response = await request(app).post("/api/users").send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("LOGISTICS")
      })

      test("should create PROGRAMMING user", async () => {
        const payload = {
          firstName: "Lucas",
          lastName: "Pereira",
          email: "lucas.pereira@gmail.com",
          password: "Test@123",
          role: "PROGRAMMING",
        }

        const response = await request(app).post("/api/users").send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.role).toBe("PROGRAMMING")
      })
    })
  })
})
