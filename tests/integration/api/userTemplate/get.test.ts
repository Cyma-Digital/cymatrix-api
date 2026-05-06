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

describe("GET /api/user-template", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/user-template")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    test("should list all userTemplates", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 1 })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 2 })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 2, templateId: 1 })

      const response = await request(app)
        .get("/api/user-template")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
      expect(response.body.data).toHaveLength(3)
    })

    test("should get userTemplate by id", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      const userTemplateCreatedResponse = await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 1 })

      const userTemplate = userTemplateCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/user-template/${userTemplate.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toMatchObject({
        id: expect.any(Number),
        userId: 1,
        templateId: 1,
      })
    })

    test("should get userTemplate by user id", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 2, templateId: 1 })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 1 })

      const userTemplateCreatedResponse = await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 2 })
      const userTemplate = userTemplateCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/user-template/user/${userTemplate.userId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toHaveLength(2)
    })

    test("should get userTemplate by template id", async () => {
      const token = await loginAndGetToken()

      await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template A", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/templates")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Template B", preset: { on: true }, editableFields: [] })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 2 })

      await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 2, templateId: 1 })

      const userTemplateCreatedResponse = await request(app)
        .post("/api/user-template")
        .set("Authorization", `Bearer ${token}`)
        .send({ userId: 1, templateId: 1 })

      const userTemplate = userTemplateCreatedResponse.body.data

      const response = await request(app)
        .get(`/api/user-template/template/${userTemplate.templateId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
      expect(response.body.data).toHaveLength(2)
    })
  })
})
