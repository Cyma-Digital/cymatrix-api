import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/categories:id", () => {
  describe("Anonymous user", () => {
    test("Should list all categories", async () => {
      await request(app).post("/api/categories").send({
        name: "mesa",
        slug: "mesa",
        iconUrl: "https://example.com/table.png",
        // createdBy: 1,
      })

      await request(app).post("/api/categories").send({
        name: "cadeira heineken",
        slug: "cadeira-heineken",
        iconUrl: "https://example.com/chairs.png",
        // createdBy: 1,
      })

      await request(app).post("/api/categories").send({
        name: "geladeira eisenbahn",
        slug: "geladeira-eisenbahn",
        iconUrl: "https://example.com/fridge.png",
        // createdBy: 1,
      })

      const response = await request(app).get("/api/categories")

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
    })

    test("Should return category by id", async () => {
      const categoryCreatedResponse = await request(app)
        .post("/api/categories")
        .send({
          name: "mesa",
          slug: "mesa",
          iconUrl: "https://example.com/table.png",
          // createdBy: 1,
        })

      const categoryId = categoryCreatedResponse.body.data.id

      const response = await request(app).get(`/api/categories/${categoryId}`)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("mesa")
    })

    test("Should return 404 (not found)", async () => {
      await request(app).post("/api/categories").send({
        name: "mesa",
        slug: "mesa",
        iconUrl: "https://example.com/table.png",
        // createdBy: 1,
      })

      const nonExistentCategory = 2

      const response = await request(app).get(
        `/api/categories/${nonExistentCategory}`,
      )

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
