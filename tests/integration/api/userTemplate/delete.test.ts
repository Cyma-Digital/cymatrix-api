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

describe("DELETE /api/user-template/:id", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
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
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 1 })

      const { id } = createResponse.body.data

      const deleteResponse = await request(app).delete(
        `/api/user-template/${id}`,
      )

      expect(deleteResponse.status).toBe(401)
      expect(deleteResponse.body.status).toBe("error")
    })
  })
  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should delete a userTemplate", async () => {
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
          .post("/api/user-template")
          .set("Authorization", `Bearer ${token}`)
          .send({ userId: 1, templateId: 1 })

        const { id } = createResponse.body.data

        const deleteResponse = await request(app)
          .delete(`/api/user-template/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(deleteResponse.status).toBe(204)

        const getResponse = await request(app)
          .get(`/api/user-template/${id}`)
          .set("Authorization", `Bearer ${token}`)

        expect(getResponse.status).toBe(404)
      })

      test("should not list deleted userTemplates", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template A",
            preset: { on: true },
            editableFields: [],
          })

        await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template B",
            preset: { on: true },
            editableFields: [],
          })

        await request(app)
          .post("/api/user-template")
          .set("Authorization", `Bearer ${token}`)
          .send({ userId: 1, templateId: 1 })

        const createResponse = await request(app)
          .post("/api/user-template")
          .set("Authorization", `Bearer ${token}`)
          .send({ userId: 1, templateId: 2 })

        const { id } = createResponse.body.data

        await request(app)
          .delete(`/api/user-template/${id}`)
          .set("Authorization", `Bearer ${token}`)

        const listResponse = await request(app)
          .get("/api/user-template")
          .set("Authorization", `Bearer ${token}`)

        expect(listResponse.body.data).toHaveLength(1)
        expect(listResponse.body.data[0].templateId).toBe(1)
      })
    })

    describe("Error cases", () => {
      test("should return 404 when userTemplate does not exist", async () => {
        const token = await loginAndGetToken()

        const response = await request(app)
          .delete("/api/user-template/99999")
          .set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe("User template not found")
      })
    })
  })
})
