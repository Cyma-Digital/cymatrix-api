import request from "supertest"
import app from "@/app"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

let token: string
let deviceId: number
let templateId: number

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()

  const deviceRes = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Device A", code: "DEV001" })
  deviceId = deviceRes.body.data.id

  const templateRes = await request(app)
    .post("/api/templates")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Texto rolando",
      preset: { on: true, bri: 200 },
      editableFields: [{ key: "text", label: "Texto", type: "text" }],
    })
  templateId = templateRes.body.data.id
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("GET /api/schedules", () => {
  describe("Authenticated user", () => {
    test("should list all content schedules", async () => {
      await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Schedule A" },
          weekdays: [1, 2, 3],
        })

      await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Schedule B" },
          weekdays: [4, 5],
        })

      const response = await request(app)
        .get("/api/schedules")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })
  })
})

describe("GET /api/schedules/:id", () => {
  describe("Authenticated user", () => {
    test("should return content schedule by id", async () => {
      const createRes = await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Hello" },
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          startTime: "08:00",
          endTime: "18:00",
        })
      const { id } = createRes.body.data

      const response = await request(app)
        .get(`/api/schedules/${id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id,
        deviceId,
        templateId,
        startTime: "08:00",
        endTime: "18:00",
      })
      expect(response.body.data.template).toBeDefined()
      expect(response.body.data.device).toBeDefined()
    })

    test("should return 404 when not found", async () => {
      const response = await request(app)
        .get("/api/schedules/99999")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
    })
  })
})

describe("GET /api/schedules with group target", () => {
  async function createClientAndLogin(email: string) {
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

  test("should expose the target of each schedule in listings", async () => {
    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Grupo A" })
    const groupId = groupRes.body.data.id

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        deviceId,
        templateId,
        customFields: { text: "Direto" },
        weekdays: [1],
      })

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        groupId,
        templateId,
        customFields: { text: "Grupo" },
        weekdays: [2],
      })

    const response = await request(app)
      .get("/api/schedules")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(2)

    const deviceSchedule = response.body.data.find(
      (schedule: { deviceId: number | null }) => schedule.deviceId !== null,
    )
    const groupSchedule = response.body.data.find(
      (schedule: { groupId: number | null }) => schedule.groupId !== null,
    )
    expect(deviceSchedule.groupId).toBeNull()
    expect(groupSchedule.groupId).toBe(groupId)
    expect(groupSchedule.deviceId).toBeNull()
  })

  test("should include the requester's group schedules in the CLIENT listing", async () => {
    const client = await createClientAndLogin("client@test.com")

    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${client.token}`)
      .send({ name: "Grupo do cliente" })

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${client.token}`)
      .send({
        groupId: groupRes.body.data.id,
        templateId,
        customFields: { text: "Grupo" },
        weekdays: [1],
      })

    const response = await request(app)
      .get("/api/schedules")
      .set("Authorization", `Bearer ${client.token}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].groupId).toBe(groupRes.body.data.id)
  })
})

describe("GET /api/schedules/group/:id", () => {
  async function createClientAndLogin(email: string) {
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

  test("should list schedules of a group", async () => {
    const client = await createClientAndLogin("client@test.com")

    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${client.token}`)
      .send({ name: "Grupo do cliente" })
    const groupId = groupRes.body.data.id

    await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${client.token}`)
      .send({
        groupId,
        templateId,
        customFields: { text: "Grupo" },
        weekdays: [1],
      })

    const response = await request(app)
      .get(`/api/schedules/group/${groupId}`)
      .set("Authorization", `Bearer ${client.token}`)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].groupId).toBe(groupId)
  })

  test("should return 403 for a CLIENT that does not own the group", async () => {
    const client = await createClientAndLogin("client@test.com")
    const other = await createClientAndLogin("other@test.com")

    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${client.token}`)
      .send({ name: "Grupo do cliente" })

    const response = await request(app)
      .get(`/api/schedules/group/${groupRes.body.data.id}`)
      .set("Authorization", `Bearer ${other.token}`)

    expect(response.status).toBe(403)
  })

  test("should return 404 when group does not exist", async () => {
    const response = await request(app)
      .get("/api/schedules/group/99999")
      .set("Authorization", `Bearer ${token}`)

    expect(response.status).toBe(404)
  })
})

describe("GET /api/schedules/device/:id", () => {
  describe("Authenticated user", () => {
    test("should list schedules by device", async () => {
      await request(app)
        .post("/api/schedules")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deviceId,
          templateId,
          customFields: { text: "Only for this device" },
          weekdays: [1],
        })

      const response = await request(app)
        .get(`/api/schedules/device/${deviceId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })
  })
})
