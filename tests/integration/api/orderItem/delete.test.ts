import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/order-items/:id", () => {
  describe("Anonymous user", () => {
    test("Should delete order item by id", async () => {
      await request(app).post("/api/addresses").send({
        userId: 1,
        label: "comércio",
        street: "Rua João Silva Souza Soares Santos",
        number: 1,
        complement: "terceiro andar",
        neighborhood: "Jardim de jardins",
        city: "Jacareí",
        state: "SP",
        zipCode: "123.456-78",
        isDefault: true,
      })

      await request(app)
        .post("/api/orders")
        .send({
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            address: {
              street: "Rua de ruas",
              number: 82,
            },
          },
          total: "135999.99",
        })

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

      await request(app)
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
          imageUrl: "medias/chair.png",
          createdBy: 1,
        })

      const orderItemCreatedResponse = await request(app)
        .post("/api/order-items")
        .send({
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
        })

      const { id } = orderItemCreatedResponse.body.data

      const response = await request(app).delete(`/api/order-items/${id}`)
      expect(response.status).toBe(204)

      const checkResponse = await request(app).get(`/api/order-items/${id}`)

      expect(checkResponse.status).toBe(404)
      expect(checkResponse.body.status).toBe("error")
      expect(checkResponse.body.message).toBeDefined()
      expect(checkResponse.body.message).toBe("Not found")
      expect(checkResponse.body.data).toBeUndefined()
    })
  })
})
