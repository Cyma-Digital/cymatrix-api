import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/orders", () => {
  describe("Anonymous user", () => {
    test("Should create a order and return 201", async () => {
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

      const payload = {
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
      }

      const response = await request(app)
        .post("/api/orders")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })
    })
  })
})
