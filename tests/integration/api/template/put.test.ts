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

describe("PUT /api/templates/:id", () => {
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should update a template", async () => {
        const token = await loginAndGetToken()

        const createResponse = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Original",
            preset: { on: true },
            editableFields: [],
          })
        const { id } = createResponse.body.data

        const response = await request(app)
          .put(`/api/templates/${id}`)
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
      test("should return 404 when template does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .put("/api/templates/99999")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Test", preset: { on: true }, editableFields: [] })

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Template not found")
      })

      test("should return 409 when updating to existing name", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template A",
            preset: { on: true },
            editableFields: [],
          })

        const createResponse = await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template B",
            preset: { on: true },
            editableFields: [],
          })
        const { id } = createResponse.body.data

        const response = await request(app)
          .put(`/api/templates/${id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template A",
            preset: { on: true },
            editableFields: [],
          })

        expect(response.status).toBe(409)
      })
    })
  })
})
