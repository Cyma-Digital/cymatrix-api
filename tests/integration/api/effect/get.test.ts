import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/effects", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/effects")
      expect(response.status).toBe(401)
    })
  })

  describe("Authenticated user", () => {
    test("should list all effects", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      const response = await request(app)
        .get("/api/effects")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body.data).toHaveLength(2)
    })
  })
})

describe("GET /api/effects/:id", () => {
  describe("Authenticated user", () => {
    test("should return effect by id", async () => {
      const token = await loginAndGetToken()

      const createResponse = await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Rainbow",
          description: "Efeito arco-iris",
          preset: { on: true, bri: 255, seg: [{ fx: 9 }] },
          editableFields: [{ key: "text", label: "Texto", type: "text" }],
        })

      const { id } = createResponse.body.data

      const response = await request(app)
        .get(`/api/effects/${id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id,
        name: "Rainbow",
        description: "Efeito arco-iris",
      })
    })

    test("should return 404 when effect does not exist", async () => {
      const token = await loginAndGetToken()

      const response = await request(app)
        .get("/api/effects/99999")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe("Effect not found")
    })
  })
})
