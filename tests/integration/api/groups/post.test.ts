import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string

async function createClientAndLogin(email = "client@test.com") {
  await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      firstName: "Client",
      lastName: "User",
      email,
      phone: "11988888888",
      password: "client123",
      role: "CLIENT",
    })

  const login = await request(app).post("/api/auth/login").send({
    email,
    password: "client123",
  })

  return login.body.data.access as string
}

async function createClientWithId(email: string) {
  const userRes = await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      firstName: "Client",
      lastName: "User",
      email,
      phone: "11988888888",
      password: "client123",
      role: "CLIENT",
    })

  const login = await request(app).post("/api/auth/login").send({
    email,
    password: "client123",
  })

  return {
    userId: userRes.body.data.id as number,
    token: login.body.data.access as string,
  }
}

async function createDevice(code: string, ownerId: number) {
  const deviceRes = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: `Device ${code}`, code })
  const deviceId = deviceRes.body.data.id as number

  await request(app)
    .patch(`/api/devices/${deviceId}/owner`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ownerId })

  return deviceId
}

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("POST /api/groups", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/groups")
        .send({ name: "Loja Centro" })

      expect(response.status).toBe(401)
    })
  })

  describe("Authenticated user", () => {
    describe("Success cases", () => {
      test("should create a group owned by the requesting user", async () => {
        const clientToken = await createClientAndLogin()

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ name: "Loja Centro" })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toMatchObject({
          id: expect.any(Number),
          name: "Loja Centro",
        })
      })

      test("should allow ADMIN to create a group for another user", async () => {
        const clientRes = await request(app)
          .post("/api/users")
          .set("Authorization", `Bearer ${token}`)
          .send({
            firstName: "Client",
            lastName: "User",
            email: "owner@test.com",
            phone: "11988888888",
            password: "client123",
            role: "CLIENT",
          })
        const clientId = clientRes.body.data.id

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Grupo do cliente", userId: clientId })

        expect(response.status).toBe(201)
        expect(response.body.data.userId).toBe(clientId)
      })

      test("should create a group with multiple devices in one call", async () => {
        const client = await createClientWithId("client@test.com")
        const deviceA = await createDevice("DEV001", client.userId)
        const deviceB = await createDevice("DEV002", client.userId)

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${client.token}`)
          .send({ name: "Loja Centro", deviceIds: [deviceA, deviceB] })

        expect(response.status).toBe(201)
        expect(response.body.data.devices).toHaveLength(2)

        const detail = await request(app)
          .get(`/api/groups/${response.body.data.id}`)
          .set("Authorization", `Bearer ${client.token}`)
        expect(detail.body.data.devices).toHaveLength(2)
      })

      test("should create an empty group when deviceIds is omitted", async () => {
        const clientToken = await createClientAndLogin()

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ name: "Loja Centro" })

        expect(response.status).toBe(201)
        expect(response.body.data.devices).toHaveLength(0)
      })
    })

    describe("Error cases", () => {
      test("should return 400 when name is missing", async () => {
        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${token}`)
          .send({})

        expect(response.status).toBe(400)
      })

      test("should return 404 when specified owner does not exist", async () => {
        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${token}`)
          .send({ name: "Grupo órfão", userId: 99999 })

        expect(response.status).toBe(404)
      })

      test("should return 403 when CLIENT creates a group for another user", async () => {
        const clientToken = await createClientAndLogin()

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${clientToken}`)
          .send({ name: "Grupo alheio", userId: 1 })

        expect(response.status).toBe(403)
      })

      test("should reject creation and persist no group when a device is invalid", async () => {
        const client = await createClientWithId("client@test.com")
        const deviceA = await createDevice("DEV001", client.userId)

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${client.token}`)
          .send({ name: "Loja Centro", deviceIds: [deviceA, 99999] })

        expect(response.status).toBe(404)

        const list = await request(app)
          .get("/api/groups")
          .set("Authorization", `Bearer ${client.token}`)
        expect(list.body.data).toHaveLength(0)
      })

      test("should return 403 when a device belongs to another user", async () => {
        const client = await createClientWithId("client@test.com")
        const other = await createClientWithId("other@test.com")
        const foreignDevice = await createDevice("DEV001", other.userId)

        const response = await request(app)
          .post("/api/groups")
          .set("Authorization", `Bearer ${client.token}`)
          .send({ name: "Loja Centro", deviceIds: [foreignDevice] })

        expect(response.status).toBe(403)
      })
    })
  })
})
