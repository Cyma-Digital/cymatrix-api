import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/brands/:id", () => {
  describe("Anonymous user", () => {
    test("Should list all brands", async () => {
      await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "medias/hnk.png",
      })

      await request(app).post("/api/brands").send({
        name: "Baden Baden",
        slug: "baden-baden",
        logoUrl: "medias/baden.png",
      })

      await request(app).post("/api/brands").send({
        name: "Eisenbahn",
        slug: "eisenbahn",
        logoUrl: "medias/eisenbahn.png",
      })

      await request(app).post("/api/brands").send({
        name: "Lagunitas",
        slug: "lagunitas",
        logoUrl: "medias/lagunitas.png",
      })

      const response = await request(app).get("/api/brands")

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
    })

    test("Should return brand by id", async () => {
      const brandCreatedResponse = await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "medias/hnk.png",
      })

      const brandId = brandCreatedResponse.body.data.id

      const response = await request(app).get(`/api/brands/${brandId}`)

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe("Heineken")
    })

    test("Should return 404 (not found)", async () => {
      await request(app).post("/api/brands").send({
        name: "Heineken",
        slug: "heineken",
        logoUrl: "medias/hnk.png",
      })

      const nonExistentBrand = 2

      const response = await request(app).get(`/api/brands/${nonExistentBrand}`)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
