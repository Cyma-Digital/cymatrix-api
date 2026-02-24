import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/categories/:id", () => {
  describe("Anonymous user", () => {
    test("Should delete category by id", async () => {
      const categoryCreatedResponse = await request(app)
        .post("/api/categories")
        .send({
          name: "Mesa",
          slug: "mesa",
          iconUrl: "https://example.com/tables.png",
          createdBy: 1,
        })

      const categoryId = categoryCreatedResponse.body.data.id

      const response = await request(app).delete(
        `/api/categories/${categoryId}`,
      )
      expect(response.status).toBe(204)

      const checkResponse = await request(app).get(
        `/api/categories/${categoryId}`,
      )

      expect(checkResponse.status).toBe(404)
      expect(checkResponse.body.status).toBe("error")
      expect(checkResponse.body.message).toBeDefined()
      expect(checkResponse.body.message).toBe("Not found")
      expect(checkResponse.body.data).toBeUndefined()
    })
  })
})
