import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/categories", () => {
  describe("Anonymous user", () => {
    test("Should create a category and return 201", async () => {
      const payload = {
        name: "mesa",
        slug: "mesa",
        iconUrl: "medias/table-icon.png",
        createdBy: 1,
      }

      const response = await request(app)
        .post("/api/categories")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })
    })
  })
})
