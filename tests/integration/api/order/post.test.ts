import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/order-items", () => {
  describe("Anonymous user", () => {
    test("Should create an order and return 201", async () => {
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

      const payload = {
        productId: 1,
        quantity: 10,
        unitPrice: "209.99",
      }

      const response = await request(app)
        .post("/api/order-items")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })
    })

    test("Should create an order and return 201 (orders already exist)", async () => {
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: "1",
          brandId: "1",
          name: "mesa customizada heineken",
          price: "509.99",
          description: "mesa customizada com o log da heineken",
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: "1",
          brandId: "1",
          name: "geladeira customizada heineken",
          price: "1209.99",
          description: "geladeira customizada com o log da heineken",
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: "1",
          brandId: "1",
          name: "poltrona customizada heineken",
          price: "120.99",
          description: "poltrona customizada com o log da heineken",
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

      const order1 = await request(app).post("/api/order-items").send({
        productId: 1,
        quantity: 10,
        unitPrice: "209.99",
      })

      await request(app)
        .patch(`/api/orders/${order1.body.data.orderId}`)
        .send({ status: "APROVADO" })

      const order2 = await request(app).post("/api/order-items").send({
        productId: 2,
        quantity: 10,
        unitPrice: "509.99",
      })

      await request(app)
        .patch(`/api/orders/${order2.body.data.orderId}`)
        .send({ status: "ENVIADO" })

      const order3 = await request(app).post("/api/order-items").send({
        productId: 3,
        quantity: 10,
        unitPrice: "1209.99",
      })

      await request(app)
        .patch(`/api/orders/${order3.body.data.orderId}`)
        .send({ status: "CANCELADO" })

      const payload = {
        productId: 4,
        quantity: 10,
        unitPrice: "120.99",
      }

      const response = await request(app)
        .post("/api/order-items")
        .send(payload)
        .expect(201)

      const { orderId } = response.body.data

      const orderCreated = await request(app).get(`/api/orders/${orderId}`)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })

      expect(orderCreated.body.data.status).toBe("PENDENTE")
      expect(orderCreated.body.data.total).toBe("1209.9")
    })

    test("Should create an order item and add in order existent and return 201", async () => {
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
          name: "geladeira customizada heineken",
          price: "1209.99",
          description: "geladeira customizada com o log da heineken",
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

      await request(app)
        .post("/api/products")
        .send({
          categoryId: "1",
          brandId: "1",
          name: "poltrona customizada heineken",
          price: "120.99",
          description: "poltrona customizada com o log da heineken",
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
        quantity: 10,
        unitPrice: "1209.99",
      })

      const payload = {
        productId: 2,
        quantity: 10,
        unitPrice: "120.99",
      }

      const response = await request(app)
        .post("/api/order-items")
        .send(payload)
        .expect(201)

      const { orderId } = response.body.data

      const orderCreated = await request(app).get(`/api/orders/${orderId}`)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })

      expect(orderCreated.body.data.status).toBe("PENDENTE")
      expect(orderCreated.body.data.total).toBe("13309.8")
    })
  })
})
