import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/order-items/:id", () => {
  describe("Anonymous user", () => {
    test("Should list all order items", async () => {
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
        price: "1209.99",
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

      await request(app).post("/api/products").send({
        categoryId: "1",
        brandId: "1",
        name: "geladeira customizada heineken",
        price: "8209.99",
        description: "geladeira customizada com o log da heineken",
        // additionalInfo: {
        //   dimentions: {
        //     width: 80,
        //     height: 170,
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
        quantity: 10,
        unitPrice: "209.99",
      })

      await request(app).post("/api/order-items").send({
        productId: "2",
        quantity: 12,
        unitPrice: "1209.99",
      })

      await request(app).post("/api/order-items").send({
        productId: "1",
        quantity: 7,
        unitPrice: "8209.99",
      })

      const response = await request(app).get("/api/order-items")

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
    })

    test("Should return order item by id", async () => {
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

      const orderItemCreatedResponse = await request(app)
        .post("/api/order-items")
        .send({
          productId: "1",
          quantity: 10,
          unitPrice: "209.99",
        })

      const { id } = orderItemCreatedResponse.body.data

      const response = await request(app).get(`/api/order-items/${id}`)

      expect(response.status).toBe(200)
      expect(response.body.data.orderId).toBe(1)
      expect(response.body.data.productId).toBe(1)
      expect(response.body.data.quantity).toBe(10)
      expect(response.body.data.unitPrice).toBe("209.99")
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

      await request(app).post("/api/order-items").send({
        productId: "1",
        quantity: 10,
        unitPrice: "209.99",
      })

      const nonExistentOrderItem = 2

      const response = await request(app).get(
        `/api/order-items/${nonExistentOrderItem}`,
      )

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
