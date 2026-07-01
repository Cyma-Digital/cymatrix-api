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

describe("PUT /api/effects/:id", () => {
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should update an effect", async () => {
        const token = await loginAndGetToken()

        const createResponse = await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Original",
            preset: { on: true },
            editableFields: [],
          })
        const { id } = createResponse.body.data

        const response = await request(app)
          .put(`/api/effects/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Updated",
            preset: { on: true, bri: 200 },
            editableFields: [{ key: "text", label: "Texto", type: "text" }],
            active: false,
          })

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("Updated")
        expect(response.body.data.active).toBe(false)
      })
    })

    describe("Error cases", () => {
      test("should return 404 when effect does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .put("/api/effects/99999")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Test", preset: { on: true }, editableFields: [] })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Effect not found")
      })

      test("should return 409 when updating to existing name", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect A",
            preset: { on: true },
            editableFields: [],
          })

        const createResponse = await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect B",
            preset: { on: true },
            editableFields: [],
          })
        const { id } = createResponse.body.data

        const response = await request(app)
          .put(`/api/effects/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Effect A",
            preset: { on: true },
            editableFields: [],
          })

        expect(response.status).toBe(409)
      })
    })
  })
})
