import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("DELETE /api/addresses/:id", () => {
  describe("Anonymous user", () => {
    test("Should delete address by id", async () => {
      const addressCreatedResponse = await request(app)
        .post("/api/addresses")
        .send({
          userId: 1,
          label: "comércio",
          street: "Rua João Silva Souza Soares Santos",
          number: 1,
          complement: "terceiro andar",
          neighborhood: "Jardim de jardins",
          city: "Jacareí",
          state: "SP",
          zipCode: "123.456-78",
          isDefault: true,
        })

      const { id } = addressCreatedResponse.body.data

      const response = await request(app).delete(`/api/addresses/${id}`)
      expect(response.status).toBe(204)

      const checkResponse = await request(app).get(`/api/addresses/${id}`)

      expect(checkResponse.status).toBe(404)
      expect(checkResponse.body.status).toBe("error")
      expect(checkResponse.body.message).toBeDefined()
      expect(checkResponse.body.message).toBe("Not found")
      expect(checkResponse.body.data).toBeUndefined()
    })
  })
})
