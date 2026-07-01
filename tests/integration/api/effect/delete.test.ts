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

describe("DELETE /api/effects/:id", () => {
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should soft delete an effect", async () => {
        const token = await loginAndGetToken()

        const createResponse = await request(app)
          .post("/api/effects")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Para deletar",
            preset: { on: true },
            editableFields: [],
          })
        const { id } = createResponse.body.data

        const deleteResponse = await request(app)
          .delete(`/api/effects/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(deleteResponse.status).toBe(204)

        const getResponse = await request(app)
          .get(`/api/effects/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(getResponse.status).toBe(404)
      })

      test("should not list deleted effect", async () => {
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

        await request(app)
          .delete(`/api/effects/${id}`)
          .set("Authorization", `Bearer ${token}`)

        const listResponse = await request(app)
          .get("/api/effects")
          .set("Authorization", `Bearer ${token}`)

        expect(listResponse.body.data).toHaveLength(1)
        expect(listResponse.body.data[0].name).toBe("Effect A")
      })
    })

    describe("Error cases", () => {
      test("should return 404 when effect does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .delete("/api/effects/99999")
          .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("Effect not found")
      })
    })
  })
})
