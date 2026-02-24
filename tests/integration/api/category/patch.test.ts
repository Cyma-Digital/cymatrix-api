import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/categories/:id", () => {
  describe("Anonymous user", () => {
    test("Should update a category and return 200", async () => {
      const categoryCreatedResponse = await request(app)
        .post("/api/categories")
        .send({
          name: "Mesa",
          slug: "mesa",
          iconUrl: "https://example.com/table.png",
          createdBy: 1,
        })

      const categoryId = categoryCreatedResponse.body.data.id

      const payload = {
        name: "Mesa",
      }

      const response = await request(app)
        .patch(`/api/categories/${categoryId}`)
        .send(payload)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("Mesa")
      expect(response.body.data.slug).toBe("mesa")
    })

    test("Should return 404 (not found)", async () => {
      await request(app).patch("/api/categories").send({
        name: "Mesa",
        slug: "mesa",
        iconUrl: "https://example.com/table.png",
      })

      const nonExistentCategory = 2

      const payload = {
        name: "Mesa",
      }

      const response = await request(app)
        .patch(`/api/categories/${nonExistentCategory}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
