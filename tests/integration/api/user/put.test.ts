import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PUT /api/users/:id", () => {
  describe("Anonymous user", () => {
    describe("Success cases", () => {
      test("should update a user", async () => {
        const payload = {
          firstName: "Original",
          lastName: "User",
          email: "original@email.com",
          phone: "(11) 99999-9999",
          document: "123.456.789-00",
          documentType: "CPF",
          password: "Test@123",
          role: "CLIENT",
        }

        const createResponse = await request(app)
          .post("/api/users")
          .send(payload)

        const { id } = createResponse.body.data

        const updatePayload = {
          firstName: "Original updated",
          lastName: "User updated",
          email: "original.updated@email.com",
          phone: "(12) 0000-1111",
          document: "933.446.781-10",
          documentType: "CPF",
          role: "CLIENT",
        }

        const response = await request(app)
          .put(`/api/users/${id}`)
          .send(updatePayload)

        expect(response.status).toBe(200)
        expect(response.body.data).toBeDefined()

        expect(response.body.data).toMatchObject({
          id: id,
          firstName: updatePayload.firstName,
          lastName: updatePayload.lastName,
          email: updatePayload.email,
          phone: updatePayload.phone,
          document: updatePayload.document,
          documentType: updatePayload.documentType,
          role: updatePayload.role,
        })

        expect(response.body.data.password).toBeUndefined()
        expect(response.body.data.passwordHash).toBeUndefined()
      })
    })

    describe("Error cases", () => {
      test("should return 400 whe ID format is invalid", async () => {
        const updatePayload = {
          firstName: "Test",
          lastName: "User",
          email: "test@email.com",
          phone: null,
          document: "123.456.789-00",
          documentType: "CPF",
          role: "CLIENT",
        }

        const response = await request(app)
          .put("/api/users/invalid-id")
          .send(updatePayload)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Validation failed")
        expect(response.body.details.fieldErrors.id).toBeDefined()
      })

      test("should return 400 whe ID format is not a number", async () => {
        const updatePayload = {
          firstName: "Test",
          lastName: "User",
          email: "test@email.com",
          phone: null,
          document: "123.456.789-00",
          documentType: "CPF",
          role: "CLIENT",
        }

        const response = await request(app)
          .put("/api/users/123abc")
          .send(updatePayload)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("Validation failed")
        expect(response.body.details.fieldErrors.id).toBeDefined()
      })

      test("should return 404 when user ID does not exist", async () => {
        const updatePayload = {
          firstName: "Test",
          lastName: "User",
          email: "test@email.com",
          phone: null,
          document: "123.456.789-00",
          documentType: "CPF",
          role: "CLIENT",
        }

        const response = await request(app)
          .put("/api/users/99999")
          .send(updatePayload)

        expect(response.status).toBe(404)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBe("User not found")
      })

      test.todo(
        "should return 404 when trying to update deleted user",
        async () => {},
      )
    })
  })
})
