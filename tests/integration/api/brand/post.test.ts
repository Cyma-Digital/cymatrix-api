import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/brands", () => {
  describe("Anonymous user", () => {
    test("Should create a brand and return 201", async () => {
      const payload = {
        name: "Heineken",
        slug: "heineken",
        logoUrl: "medias/hnk.png",
      }

      const response = await request(app)
        .post("/api/brands")
        .send(payload)
        .expect(201)

      expect(response.body).toMatchObject({
        status: "success",
        data: payload,
      })
    })
  })
})
