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

describe("POST /api/user-template/", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const payload = {
        userId: 1,
        templateId: 1,
      }

      const response = await request(app)
        .post("/api/user-template")
        .send(payload)

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create userTemplate", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template A",
            preset: { on: true },
            editableFields: [],
          })

        const payload = {
          userId: 1,
          templateId: 1,
        }

        const response = await request(app)
          .post("/api/user-template")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          userId: payload.userId,
          templateId: payload.templateId,
        })
      })
    })

    describe("Error cases", () => {
      test("should return 404 when user not found", async () => {
        const token = await loginAndGetToken()

        await request(app)
          .post("/api/templates")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "Template A",
            preset: { on: true },
            editableFields: [],
          })

        const payload = {
          userId: 2,
          templateId: 1,
        }

        const response = await request(app)
          .post("/api/user-template")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("User not found")
      })

      test("should return 404 when template not found", async () => {
        const token = await loginAndGetToken()

        const payload = {
          userId: 1,
          templateId: 1,
        }

        const response = await request(app)
          .post("/api/user-template")
          .set("Authorization", `Bearer ${token}`)
          .send(payload)

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Template not found")
      })
    })
  })
})
