import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/orders/:id", () => {
  describe("Anonymous user", () => {
    test("Should delete an order by id", async () => {
      await request(app).post("/api/categories").send({
        name: "Mesa",
        slug: "mesa",
        iconUrl: "https://example.com/table.png",
        // createdBy: 1,
      })

      await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "https://example.com/heineken.png",
      })

      await request(app).post("/api/products").send({
        categoryId: "1",
        brandId: "1",
        name: "cadeira customizada heineken",
        price: "200.99",
        description: "cadeira customizada com o log da heineken",
        // additionalInfo: {
        //   dimentions: {
        //     width: 50,
        //     height: 100,
        //     thickness: 5,
        //   },
        //   warranty: 12,
        //   material: "madeira",
        //   madeAt: "2026-02-04T16:40:23.130Z",
        // },
        avaliable: true,
        imageUrl: "https://example.com/chairs.png",
        // createdBy: 1,
      })

      const orderCreatedResponse = await request(app)
        .post("/api/order-items")
        .send({
          productId: "1",
          quantity: 2,
          unitPrice: "1209.01",
        })

      const { id } = orderCreatedResponse.body.data

      const response = await request(app).delete(`/api/orders/${id}`)
      expect(response.status).toBe(204)

      const checkResponse = await request(app).get(`/api/orders/${id}`)

      expect(checkResponse.status).toBe(404)
      expect(checkResponse.body.status).toBe("error")
      expect(checkResponse.body.message).toBeDefined()
      expect(checkResponse.body.message).toBe("Not found")
      expect(checkResponse.body.data).toBeUndefined()
    })
  })
})
