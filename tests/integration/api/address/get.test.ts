import request from "supertest"
import app from "@/app"
import { orchestrator } from "../../../helpers/orchestrator"

beforeEach(async () => {
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/addresses/:id", () => {
  describe("Anonymous user", () => {
    test("Should list all addresses", async () => {
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

      await request(app).post("/api/addresses").send({
        userId: 1,
        label: "loja",
        street: "Rua Zé Silva Souza Soares Santos",
        number: 2,
        neighborhood: "Jardim de cactos",
        city: "Jacareí",
        state: "SP",
        zipCode: "987.654-32",
        isDefault: true,
      })

      await request(app).post("/api/addresses").send({
        userId: 1,
        label: "indústria",
        street: "Rua Zeca Silva Souza Soares Santos",
        number: 234,
        complement: "segundo prédio",
        neighborhood: "Jardim das fábricas",
        city: "Jacareí",
        state: "SP",
        zipCode: "321.456-87",
        isDefault: true,
      })

      const response = await request(app).get("/api/addresses")

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toMatchObject({
        status: "success",
        data: expect.any(Array),
      })
    })

    test("Should return address by id", async () => {
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

      const response = await request(app).get(`/api/addresses/${id}`)

      expect(response.status).toBe(200)
      expect(response.body.data.street).toBe(
        "Rua João Silva Souza Soares Santos",
      )
      expect(response.body.data.number).toBe(1)
      expect(response.body.data.neighborhood).toBe("Jardim de jardins")
      expect(response.body.data.city).toBe("Jacareí")
      expect(response.body.data.state).toBe("SP")
      expect(response.body.data.zipCode).toBe("123.456-78")
    })

    test("Should return 404 (not found)", async () => {
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

      const nonExistentAddress = 2

      const response = await request(app).get(
        `/api/addresses/${nonExistentAddress}`,
      )

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBeDefined()
      expect(response.body.message).toBe("Not found")
      expect(response.body.data).toBeUndefined()
    })
  })
})
