import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/products/:id", () => {
  describe("Anonymous user", () => {
    test("Should delete product by id", async () => {
      await request(app).post("/api/categories").send({
        name: "Mesa",
        slug: "mesa",
        iconUrl: "medias/table-icon.png",
        createdBy: 1,
      })

      await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "medias/hnk.png",
      })

      const productCreatedResponse = await request(app)
        .post("/api/products")
        .send({
          categoryId: 1,
          brandId: 1,
          name: "cadeira customizada heineken",
          price: "209.99",
          description: "cadeira customizada com o log da heineken",
          additionalInfo: {
            dimentions: {
              width: 50,
              height: 100,
              thickness: 5,
            },
            warranty: 12,
            material: "madeira",
            madeAt: "2026-02-04T16:40:23.130Z",
          },
          avaliable: true,
          createdBy: 1,
        })

      const productId = productCreatedResponse.body.data.id

      const response = await request(app).delete(`/api/products/${productId}`)
      expect(response.status).toBe(204)

      const checkResponse = await request(app).get(`/api/products/${productId}`)

      expect(checkResponse.status).toBe(404)
      expect(checkResponse.body.status).toBe("error")
      expect(checkResponse.body.message).toBeDefined()
      expect(checkResponse.body.message).toBe("Not found")
      expect(checkResponse.body.data).toBeUndefined()
    })
  })
})
