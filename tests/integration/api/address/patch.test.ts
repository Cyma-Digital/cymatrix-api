import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/addresses/:id", () => {
  describe("Anonymous user", () => {
    test("Should update a address and return 200", async () => {
      const addressCreatedResponse = await request(app)
        .post("/api/addresses")
        .send({
          userId: "1",
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

      const payload = {
        label: "loja",
        street: "Rua Paulo de Paula",
        number: 28,
      }

      const response = await request(app)
        .patch(`/api/addresses/${id}`)
        .send(payload)

      expect(response.status).toBe(200)
      expect(response.body.data.label).toBe("loja")
      expect(response.body.data.street).toBe("Rua Paulo de Paula")
      expect(response.body.data.number).toBe(28)
      expect(response.body.data.complement).toBe("terceiro andar")
      expect(response.body.data.neighborhood).toBe("Jardim de jardins")
      expect(response.body.data.city).toBe("Jacareí")
      expect(response.body.data.state).toBe("SP")
      expect(response.body.data.zipCode).toBe("123.456-78")
      expect(response.body.data.isDefault).toBe(true)
    })

    test("Should return 404 (not found)", async () => {
      await request(app).patch("/api/addresses").send({
        userId: "1",
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

      const nonExistentAddress = 2

      const payload = {
        street: "Rua Paulo de Paula",
        number: 28,
      }

      const response = await request(app)
        .patch(`/api/addresses/${nonExistentAddress}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
