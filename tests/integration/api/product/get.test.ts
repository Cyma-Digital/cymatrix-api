import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/products/:id", () => {
  describe("Anonymous user", () => {
    test("Should list all brands", async () => {
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
          createdBy: 1,
        })

      await request(app)
        .post("/api/products")
        .send({
          categoryId: 1,
          brandId: 1,
          name: "geladeira customizada heineken",
          price: "8209.99",
          description: "geladeira customizada com o log da heineken",
          additionalInfo: {
            dimentions: {
              width: 80,
              height: 170,
            },
            warranty: 12,
            material: "madeira",
            madeAt: "2026-02-04T16:40:23.130Z",
          },
          avaliable: true,
          createdBy: 1,
        })

      const response = await request(app).get("/api/products")

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
    })

    test("Should return product by id", async () => {
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

      const response = await request(app).get(`/api/products/${productId}`)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("cadeira customizada heineken")
      expect(response.body.data.brandId).toBe(1)
      expect(response.body.data.categoryId).toBe(1)
    })

    test("Should return 404 (not found)", async () => {
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
          createdBy: 1,
        })

      const nonExistentProduct = 2

      const response = await request(app).get(
        `/api/products/${nonExistentProduct}`,
      )

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
