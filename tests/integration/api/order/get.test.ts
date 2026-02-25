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
      await request(app).post("/api/categories").send({
        name: "Mesa",
        slug: "mesa",
        iconUrl: "https://example.com/table.png",
        createdBy: 1,
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
        price: "209.99",
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

      await request(app).post("/api/products").send({
        categoryId: "1",
        brandId: "1",
        name: "mesa customizada heineken",
        price: "209.99",
        description: "mesa customizada com o log da heineken",
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

      await request(app).post("/api/products").send({
        categoryId: "1",
        brandId: "1",
        name: "geladeira customizada heineken",
        price: "209.99",
        description: "geladeira customizada com o log da heineken",
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

      const order1 = await request(app).post("/api/order-items").send({
        productId: "1",
        quantity: 2,
        unitPrice: "200.99",
      })

      await request(app).patch(`/api/order-items/${order1.body.id}`).send({
        status: "APROVADO",
      })

      const order2 = await request(app).post("/api/order-items").send({
        productId: "2",
        quantity: 2,
        unitPrice: "200.99",
      })

      await request(app).patch(`/api/order-items/${order2.body.id}`).send({
        status: "CANCELADO",
      })

      const order3 = await request(app).post("/api/order-items").send({
        productId: "3",
        quantity: 2,
        unitPrice: "200.99",
      })

      await request(app).patch(`/api/order-items/${order3.body.id}`).send({
        status: "ENVIADO",
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
          unitPrice: "200.99",
        })

      const { orderId } = orderCreatedResponse.body.data

      const response = await request(app).get(`/api/orders/${orderId}`)

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe("PENDENTE")
      expect(response.body.data.total).toBe("401.98")
    })

    test("Should return order by id with order items", async () => {
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
        price: "209.99",
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

      await request(app).post("/api/products").send({
        categoryId: "1",
        brandId: "1",
        name: "mesa customizada heineken",
        price: "200",
        description: "mesa customizada com o log da heineken",
        // additionalInfo: {
        //   dimentions: {
        //     width: 120,
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

      await request(app).post("/api/order-items").send({
        productId: "2",
        quantity: 4,
        unitPrice: "200",
      })

      const orderCreatedResponse = await request(app)
        .post("/api/order-items")
        .send({
          productId: "1",
          quantity: 1,
          unitPrice: "209.99",
        })

      const { orderId } = orderCreatedResponse.body.data

      const response = await request(app).get(
        `/api/orders/order/items/${orderId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe("PENDENTE")
      expect(response.body.data.total).toBe("1009.99")
      expect(Array.isArray(response.body.data.orderItems)).toBe(true)
    })

    test("Should return 404 (not found)", async () => {
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

      await request(app).post("/api/order-items").send({
        productId: "1",
        quantity: 4,
        unitPrice: "200",
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
