import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/products/:id", () => {
  describe("Anonymous user", () => {
    test("Should update a product and return 200", async () => {
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

      const productCreatedResponse = await request(app)
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

      const productId = productCreatedResponse.body.data.id

      const payload = {
        name: "cadeira heineken",
        price: "599.99",
      }

      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .send(payload)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("cadeira heineken")
      expect(response.body.data.price).toBe("599.99")
      expect(response.body.data.description).toBe(
        "cadeira customizada com o log da heineken",
      )
      expect(response.body.data.avaliable).toBe(true)
      expect(response.body.data.categoryId).toBe(1)
      expect(response.body.data.brandId).toBe(1)
    })

    test("Should return 404 (category not found)", async () => {
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

      const productCreatedResponse = await request(app)
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

      const productId = productCreatedResponse.body.data.id

      const payload = {
        categoryId: 2,
        name: "cadeira heineken",
        price: "599,99",
      }

      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Category not found")
      expect(response.body.data).toBeUndefined()
    })

    test("Should return 404 (brand not found)", async () => {
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

      const productCreatedResponse = await request(app)
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

      const productId = productCreatedResponse.body.data.id

      const payload = {
        brandId: 2,
        name: "cadeira heineken",
        price: "599,99",
      }

      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Brand not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
