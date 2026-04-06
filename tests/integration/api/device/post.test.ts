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

describe("POST /api/devices", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const payload = {
        name: "Padaria Bom Pão - Vitrine",
        code: "PAD001",
      }

      const response = await request(app).post("/api/devices").send(payload)

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create device with all fields", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Padaria Bom Pão - Vitrine",
          code: "PAD001",
          address: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567",
        }

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          name: "Padaria Bom Pão - Vitrine",
          code: "PAD001",
          address: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567",
        })
      })

      test("should create device with only required fields", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Restaurante Sabor - Entrada",
          code: "RST001",
        }

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          name: "Restaurante Sabor - Entrada",
          code: "RST001",
        })
        expect(response.body.data.address).toBeNull()
        expect(response.body.data.city).toBeNull()
        expect(response.body.data.state).toBeNull()
        expect(response.body.data.zipCode).toBeNull()
      })

      test("should create device with partial address", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Pet Shop Amigo - Fachada",
          code: "PET001",
          city: "Curitiba",
          state: "PR",
        }

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data.city).toBe("Curitiba")
        expect(response.body.data.state).toBe("PR")
        expect(response.body.data.address).toBeNull()
      })
    })

    describe("Error cases", () => {
      test("should return 409 when code already exists", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Padaria Bom Pão - Vitrine",
          code: "PAD001",
        }

        await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Outro Device",
            code: "PAD001",
          })

        expect(response.status).toBe(409)
        expect(response.body.status).toBe("error")
      })

      test("should return 422 when name is missing", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({ code: "PAD001" })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })

      test("should return 422 when code is missing", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Device sem código" })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })

      test("should return 400 when state is not 2 characters", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/devices")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Device",
            code: "DEV001",
            state: "São Paulo",
          })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })
    })
  })
})
