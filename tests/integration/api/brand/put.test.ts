import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/brands/:id", () => {
  describe("Anonymous user", () => {
    test("Should update a brand and return 200", async () => {
      const brandCreatedResponse = await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "https://example.com/heineken.png",
      })

      const brandId = brandCreatedResponse.body.data.id

      const payload = {
        name: "Heineken 0.0",
      }

      const response = await request(app)
        .patch(`/api/brands/${brandId}`)
        .send(payload)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("Heineken 0.0")
      expect(response.body.data.slug).toBe("heineken")
    })

    test("Should return 404 (not found)", async () => {
      await request(app).patch("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "https://example.com/heineken.png",
      })

      const nonExistentBrand = 2

      const payload = {
        name: "Heineken 0.0",
      }

      const response = await request(app)
        .patch(`/api/brands/${nonExistentBrand}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
