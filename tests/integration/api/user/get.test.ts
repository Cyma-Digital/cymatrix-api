import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/users", () => {
  describe("Anonymous user", () => {
    describe("Success cases", () => {
      test("should list all users", async () => {
        await request(app).post("/api/users").send({
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        })
        await request(app).post("/api/users").send({
          firstName: "Emanuelly",
          lastName: "Martins",
          email: "emanuelly.martins29@bol.com.br",
          phone: "(97) 83440-8270",
          password: "Test@123",
          role: "STAFF",
        })
        await request(app).post("/api/users").send({
          firstName: "Fábio",
          lastName: "Nogueira",
          email: "fabio_nogueira63@hotmail.com",
          password: "Test@123",
          role: "FINANCE",
        })

        const response = await request(app).get("/api/users")

        expect(response.status).toBe(200)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toBeDefined()
        expect(response.body).toMatchObject({
          status: "success",
          data: expect.any(Array),
        })
        expect(response.body.data).toHaveLength(4)
      })
    })
  })
})

describe("GET /api/users/:id", () => {
  describe("Anonymous user", () => {
    describe("Success cases", () => {
      test("should return user by id", async () => {
        const userCreatedResponse = await request(app).post("/api/users").send({
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
          password: "Test@123",
          role: "ADMIN",
        })

        const user = userCreatedResponse.body.data
        const response = await request(app).get(`/api/users/${user.id}`)

        expect(response.status).toBe(200)
        expect(response.body.data).toBeDefined()
        expect(response.body.data).toMatchObject({
          id: user.id,
          firstName: "Alessandro",
          lastName: "Santos",
          email: "alessandro_santos@gmail.com",
          phone: "(15) 7614-8559",
        })
      })
    })
  })
})
