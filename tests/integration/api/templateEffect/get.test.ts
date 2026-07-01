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

describe("GET /api/template-effect", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/template-effect")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    test("should list all templateEffects", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 1 })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 2 })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 2, effectId: 1 })

      const response = await request(app)
        .get("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
      expect(response.body.data).toHaveLength(3)
    })

    test("should get templateEffect by id", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      const templateEffectCreatedResponse = await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 1 })

      const templateEffect = templateEffectCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/template-effect/${templateEffect.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toMatchObject({
        id: expect.any(Number),
        templateId: 1,
        effectId: 1,
      })
    })

    test("should get templateEffect by template id", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 2, effectId: 1 })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 1 })

      const templateEffectCreatedResponse = await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 2 })
      const templateEffect = templateEffectCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/template-effect/template/${templateEffect.templateId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toHaveLength(2)
    })

    test("should get templateEffect by effect id", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/effects")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Effect B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 2 })

      await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 2, effectId: 1 })

      const templateEffectCreatedResponse = await request(app)
        .post("/api/template-effect")
        .set("Authorization", `Bearer ${token}`)
        .send({ templateId: 1, effectId: 1 })

      const templateEffect = templateEffectCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/template-effect/effect/${templateEffect.effectId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toHaveLength(2)
    })
  })
})
