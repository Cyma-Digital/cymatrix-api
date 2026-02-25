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
    test("Should create an order item and return 201", async () => {
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

      const payload = {
        productId: "1",
        quantity: 2,
        unitPrice: "120.89",
      }

      const response = await request(app)
        .post("/api/order-items")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: {
          ...payload,
          productId: 1,
        },
      })
    })

    describe("order already exist with status pendent", () => {
      test("Should create an order item and return 201", async () => {
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

        await request(app).post("/api/products").send({
          categoryId: "1",
          brandId: "1",
          name: "mesa customizada heineken",
          price: "1209.01",
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

        await request(app)
          .post("/api/order-items")
          .send({
            productId: "1",
            quantity: 2,
            unitPrice: "200.99",
          })
          .expect(201)

        const payload = {
          productId: "1",
          quantity: 2,
          unitPrice: "1209.01",
        }

        const response = await request(app)
          .post("/api/order-items")
          .send(payload)
          .expect(201)

        expect(response.body).toMatchObject({
          status: "success",
          data: {
            ...payload,
            productId: 1,
          },
        })
      })
    })
  })
})
