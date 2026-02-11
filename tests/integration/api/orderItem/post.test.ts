import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/order-items", () => {
  describe("Anonymous user", () => {
    test("Should create an order item and return 201", async () => {
      const payload = {
        orderId: 1,
        productId: 1,
        quantity: 50,
        unitPrice: "120.00",
      }

      const response = await request(app)
        .post("/api/order-items")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })
    })
  })
})
