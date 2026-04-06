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

describe("GET /api/templates", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/templates")
      expect(response.status).toBe(401)
    })
  })

  describe("Authenticated user", () => {
    test("should list all templates", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      const response = await request(app)
        .get("/api/templates")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body.data).toHaveLength(2)
    })
  })
})

describe("GET /api/templates/:id", () => {
  describe("Authenticated user", () => {
    test("should return template by id", async () => {
      const token = await loginAndGetToken()

      const createResponse = await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Rainbow",
          description: "Efeito arco-iris",
          preset: { on: true, bri: 255, seg: [{ fx: 9 }] },
          editableFields: [{ key: "text", label: "Texto", type: "text" }],
        })

      const { id } = createResponse.body.data

      const response = await request(app)
        .get(`/api/templates/${id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id,
        name: "Rainbow",
        description: "Efeito arco-iris",
      })
    })

    test("should return 404 when template does not exist", async () => {
      const token = await loginAndGetToken()

      const response = await request(app)
        .get("/api/templates/99999")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.message).toBe("Template not found")
    })
  })
})
