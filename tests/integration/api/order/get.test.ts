import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/orders/:id", () => {
  describe("Anonymous user", () => {
    test("Should list all orders", async () => {
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

      await request(app)
        .post("/api/orders")
        .send({
          userId: 1,
          status: "CANCELADO",
          addressId: 1,
          shippingAddress: {
            address: {
              street: "Rua dos Silvas",
              number: 97,
            },
          },
          total: "2135999.99",
        })

      await request(app)
        .post("/api/orders")
        .send({
          userId: 1,
          status: "APROVADO",
          addressId: 1,
          shippingAddress: {
            address: {
              street: "Rua dos Soares",
              number: 97,
            },
          },
          total: "2135999.99",
        })

      const response = await request(app).get("/api/orders")

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
    })

    test("Should return order by id", async () => {
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

      const orderCreatedResponse = await request(app)
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

      const { id } = orderCreatedResponse.body.data

      const response = await request(app).get(`/api/orders/${id}`)

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe("PENDENTE")
      expect(response.body.data.addressId).toBe(1)
      expect(response.body.data.total).toBe("135999.99")
    })

    test("Should return order by id with order items", async () => {
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: 1,
          brandId: 1,
          name: "mesa customizada heineken",
          price: "1209.99",
          description: "mesa customizada com o log da heineken",
          additionalInfo: {
            dimentions: {
              width: 120,
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

      const orderCreatedResponse = await request(app)
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
          total: "409.99",
        })

      await request(app).post("/api/order-items").send({
        orderId: 1,
        productId: 1,
        quantity: 1,
        unitPrice: "209.99",
      })

      await request(app).post("/api/order-items").send({
        orderId: 1,
        productId: 2,
        quantity: 1,
        unitPrice: "200",
      })

      const { id } = orderCreatedResponse.body.data

      const response = await request(app).get(`/api/orders/order-items/${id}`)

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe("PENDENTE")
      expect(response.body.data.addressId).toBe(1)
      expect(response.body.data.total).toBe("409.99")
      expect(Array.isArray(response.body.data.orderItems)).toBe(true)
    })

    test("Should return 404 (not found)", async () => {
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

      const nonExistentOrder = 2

      const response = await request(app).get(`/api/orders/${nonExistentOrder}`)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
