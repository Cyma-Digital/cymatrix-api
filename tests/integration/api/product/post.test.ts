import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/products", () => {
  describe("Anonymous user", () => {
    test("Should create a product and return 201", async () => {
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

      const payload = {
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
        // createdBy: 1,
      }

      const response = await request(app)
        .post("/api/products")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: {
          ...payload,
          brandId: 1,
          categoryId: 1,
        },
      })
    })

    test("Should return error 404 (brand not found)", async () => {
      await request(app).post("/api/categories").send({
        name: "Mesa",
        slug: "mesa",
        iconUrl: "https://example.com/table.png",
        // createdBy: 1,
      })

      const payload = {
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
        // createdBy: 1,
      }

      const response = await request(app)
        .post("/api/products")
        .send(payload)
        .expect(404)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Brand not found")
      expect(response.body.data).toBeUndefined()
    })

    test("Should return error 404 (category not found)", async () => {
      await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "https://example.com/heineken.png",
      })

      const payload = {
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
        // createdBy: 1,
      }

      const response = await request(app)
        .post("/api/products")
        .send(payload)
        .expect(404)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Category not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
