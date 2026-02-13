import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/orders/:id", () => {
  describe("Anonymous user", () => {
    test("Should update an order and return 200", async () => {
      await request(app).post("/api/addresses").send({
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

      const orderCreatedResponse = await request(app)
        .post("/api/orders")
        .send({
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            address: {
              street: "Rua de ruas",
              number: 82,
            },
          },
          // total: "135999.99",
        })

      const { id } = orderCreatedResponse.body.data

      const payload = {
        status: "APROVADO",
      }

      const response = await request(app)
        .patch(`/api/orders/${id}`)
        .send(payload)

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe("APROVADO")
      expect(response.body.data.total).toBe("0")
    })

    test("Should return 404 (not found)", async () => {
      await request(app)
        .patch(`/api/orders`)
        .send({
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            address: {
              street: "Rua de ruas",
              number: 82,
            },
          },
          total: "135999.99",
        })

      const nonExistentOrder = 2

      const payload = {
        status: "APROVADO",
      }

      const response = await request(app)
        .patch(`/api/orders/${nonExistentOrder}`)
        .send(payload)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })

    describe("order cancelled case", () => {
      test("Should return 403 (Not allowed change order after cancelled)", async () => {
        await request(app).post("/api/addresses").send({
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

        const orderCreatedResponse = await request(app)
          .post("/api/orders")
          .send({
            userId: 1,
            status: "CANCELADO",
            addressId: 1,
            shippingAddress: {
              address: {
                street: "Rua de ruas",
                number: 82,
              },
            },
            total: "135999.99",
          })

        const { id } = orderCreatedResponse.body.data

        const payload = {
          status: "ENVIADO",
          total: "1",
        }

        const response = await request(app)
          .patch(`/api/orders/${id}`)
          .send(payload)

        expect(response.status).toBe(403)
        expect(response.body.status).toBe("error")
        expect(response.body.message).toBeDefined()
        expect(response.body.message).toBe(
          "Not allowed change order after cancelled",
        )
        expect(response.body.data).toBeUndefined()
      })
    })

    describe("order status approved or sent case", () => {
      test("Should return 200 (update order status)", async () => {
        await request(app).post("/api/addresses").send({
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

        const orderCreatedResponse = await request(app)
          .post("/api/orders")
          .send({
            userId: 1,
            status: "APROVADO",
            addressId: 1,
            shippingAddress: {
              address: {
                street: "Rua de ruas",
                number: 82,
              },
            },
          })

        const { id } = orderCreatedResponse.body.data

        const payload = {
          status: "CANCELADO",
        }

        const response = await request(app)
          .patch(`/api/orders/${id}`)
          .send(payload)

        expect(response.status).toBe(200)
        expect(response.body.data.status).toBe("CANCELADO")
        expect(response.body.data.total).toBe("0")
      })
    })
  })
})
