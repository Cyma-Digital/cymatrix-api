import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/orders/:id", () => {
  describe("Anonymous user", () => {
    test("Should update an order and return 200", async () => {
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: "1",
          brandId: "1",
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
          imageUrl: "https://example.com/chairs.png",
          createdBy: 1,
        })

      const orderCreatedResponse = await request(app)
        .post("/api/order-items")
        .send({
          productId: 1,
          quantity: 2,
          unitPrice: "200.50",
        })

      const { orderId } = orderCreatedResponse.body.data

      const payload = {
        status: "APROVADO",
      }

      const response = await request(app)
        .patch(`/api/orders/${orderId}`)
        .send(payload)

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe("APROVADO")
      expect(response.body.data.total).toBe("401")
    })

    test("Should return 404 (not found)", async () => {
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: "1",
          brandId: "1",
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
          imageUrl: "https://example.com/chairs.png",
          createdBy: 1,
        })

      await request(app).post("/api/order-items").send({
        productId: 1,
        quantity: 2,
        unitPrice: "200.50",
      })

      const nonExistentOrder = 2

      const payload = {
        status: "APROVADO",
      }

      const response = await request(app)
        .patch(`/api/orders/${nonExistentOrder}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })

    describe("order cancelled case", () => {
      test("Should return 403 (Not allowed change order after cancelled)", async () => {
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

        await request(app)
          .post("/api/products")
          .send({
            categoryId: "1",
            brandId: "1",
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
            imageUrl: "https://example.com/chairs.png",
            createdBy: 1,
          })

        const orderCreatedResponse = await request(app)
          .post("/api/order-items")
          .send({
            productId: 1,
            quantity: 2,
            unitPrice: "200.50",
          })

        const { orderId } = orderCreatedResponse.body.data

        await request(app).patch(`/api/orders/${orderId}`).send({
          status: "CANCELADO",
        })

        const payload = {
          status: "ENVIADO",
          total: "1",
        }

        const response = await request(app)
          .patch(`/api/orders/${orderId}`)
          .send(payload)

        expect(response.status).toBe(403)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBeDefined()
        expect(response.body.message).toBe(
          "Not allowed change order after cancelled",
        )
        expect(response.body.data).toBeUndefined()
      })
    })

    describe("order status approved or sent case", () => {
      test("Should return 200 (update order status)", async () => {
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

        await request(app)
          .post("/api/products")
          .send({
            categoryId: "1",
            brandId: "1",
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
            imageUrl: "https://example.com/chairs.png",
            createdBy: 1,
          })

        const orderCreatedResponse = await request(app)
          .post("/api/order-items")
          .send({
            productId: 1,
            quantity: 2,
            unitPrice: "200.50",
          })

        const { orderId } = orderCreatedResponse.body.data

        await request(app).patch(`/api/orders/${orderId}`).send({
          status: "ENVIADO",
        })

        const payload = {
          status: "CANCELADO",
        }

        const response = await request(app)
          .patch(`/api/orders/${orderId}`)
          .send(payload)

        expect(response.status).toBe(200)
        expect(response.body.data.status).toBe("CANCELADO")
        expect(response.body.data.total).toBe("401")
      })
    })
  })
})
