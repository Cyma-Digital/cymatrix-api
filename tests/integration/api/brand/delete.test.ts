import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/brands/:id", () => {
  describe("Anonymous user", () => {
    test("Should delete brand by id", async () => {
      const brandCreatedResponse = await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "medias/hnk.png",
      })

      const brandId = brandCreatedResponse.body.data.id

      const response = await request(app).delete(`/api/brands/${brandId}`)
      expect(response.status).toBe(204)

      const checkResponse = await request(app).get(`/api/brands/${brandId}`)

      expect(checkResponse.status).toBe(404)
      expect(checkResponse.body.status).toBe("error")
      expect(checkResponse.body.message).toBeDefined()
      expect(checkResponse.body.message).toBe("Not found")
      expect(checkResponse.body.data).toBeUndefined()
    })
  })
})
