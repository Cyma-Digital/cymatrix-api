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

describe("POST /api/templates", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/templates")
        .send({
          name: "Texto rolando",
          preset: { on: true, bri: 200, seg: [{ fx: 78 }] },
          editableFields: [{ key: "text", label: "Texto", type: "text" }],
        })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create template with all fields", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Texto rolando vermelho",
          description: "Texto rolando com fundo vermelho",
          preset: {
            on: true,
            bri: 200,
            seg: [{ fx: 78, sx: 80, col: [[255, 0, 0]] }],
          },
          editableFields: [
            { key: "text", label: "Texto", type: "text" },
            { key: "color", label: "Cor", type: "color" },
          ],
        }

        const response = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          name: "Texto rolando vermelho",
          description: "Texto rolando com fundo vermelho",
          active: true,
        })
        expect(response.body.data.preset).toBeDefined()
        expect(response.body.data.editableFields).toHaveLength(2)
      })

      test("should create template without description", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Fire effect",
          preset: { on: true, bri: 150, seg: [{ fx: 66 }] },
          editableFields: [],
        }

        const response = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.data.name).toBe("Fire effect")
        expect(response.body.data.editableFields).toHaveLength(0)
      })
    })

    describe("Error cases", () => {
      test("should return 409 when name already exists", async () => {
        const token = await loginAndGetToken()
        const payload = {
          name: "Texto rolando",
          preset: { on: true },
          editableFields: [],
        }

        await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        const response = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(409)
        expect(response.body.status).toBe("error")
      })

      test("should return 400 when name is missing", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({ preset: { on: true }, editableFields: [] })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })

      test("should return 400 when preset is missing", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Test", editableFields: [] })

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
      })
    })
  })
})
