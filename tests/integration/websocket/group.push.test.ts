import request from "supertest"
import { WebSocket } from "ws"
import app from "@/app"
import { registerDevice, removeDevice } from "@/websocket/websocket.manager"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

const DEVICE_CODE = "DEV001"
const allWeekdays = [0, 1, 2, 3, 4, 5, 6]

let token: string
let clientToken: string
let clientId: number
let deviceId: number
let templateId: number
let received: Array<{ type: string; data: unknown[] }>

function connectFakeDevice(code: string) {
  const fakeSocket = {
    readyState: WebSocket.OPEN,
    send: (payload: string) => {
      received.push(JSON.parse(payload))
    },
  } as unknown as WebSocket
  registerDevice(code, fakeSocket)
}

// Pushes are fire-and-forget: setup requests may deliver their push after the
// test resets `received`. Wait until no new message lands for one interval
// before acting, so only the action under test produces new pushes.
async function settlePushes() {
  let previousCount = -1
  await vi.waitFor(
    () => {
      if (received.length === previousCount) return
      previousCount = received.length
      throw new Error("pushes still arriving")
    },
    { timeout: 5000, interval: 200 },
  )
}

async function waitForContentPush(expectedLength: number) {
  await vi.waitFor(() => {
    expect(
      received.some(
        (message) =>
          message.type === "content:update" &&
          message.data.length === expectedLength,
      ),
    ).toBe(true)
  })
}

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

async function createGroup(name: string) {
  const response = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ name })
  return response.body.data.id as number
}

async function addDeviceToGroup(groupId: number) {
  await request(app)
    .post(`/api/groups/${groupId}/devices`)
    .set("Authorization", `Bearer ${clientToken}`)
    .send({ deviceIds: [deviceId] })
}

async function createGroupSchedule(groupId: number, text: string) {
  const response = await request(app)
    .post("/api/schedules")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({
      groupId,
      templateId,
      customFields: { text },
      weekdays: allWeekdays,
    })
  return response.body.data.id as number
}

beforeEach(async () => {
  await orchestrator.setup()
  token = await loginAndGetToken()

  const client = await createClientAndLogin("client@test.com")
  clientToken = client.token
  clientId = client.userId

  const deviceRes = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Device A", code: DEVICE_CODE })
  deviceId = deviceRes.body.data.id

  await request(app)
    .patch(`/api/devices/${deviceId}/owner`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ownerId: clientId })

  const templateRes = await request(app)
    .post("/api/templates")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Texto rolando",
      preset: { on: true, text: "default" },
      editableFields: [{ key: "text", label: "Texto", path: "text" }],
    })
  templateId = templateRes.body.data.id

  received = []
  connectFakeDevice(DEVICE_CODE)
})

afterEach(() => {
  removeDevice(DEVICE_CODE)
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("group content push", () => {
  test("creating a group schedule pushes content to member devices", async () => {
    const groupId = await createGroup("Loja Centro")
    await addDeviceToGroup(groupId)
    await settlePushes()
    received = []

    await createGroupSchedule(groupId, "Novo conteúdo")

    await waitForContentPush(1)
  })

  test("adding a device to a group pushes the group content to it", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await settlePushes()
    received = []

    await addDeviceToGroup(groupId)

    await waitForContentPush(1)
  })

  test("removing a device from a group pushes content without the group schedules", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)
    await settlePushes()
    received = []

    await request(app)
      .delete(`/api/groups/${groupId}/devices/${deviceId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    await waitForContentPush(0)
  })

  test("deleting a group schedule pushes updated content to member devices", async () => {
    const groupId = await createGroup("Loja Centro")
    const scheduleId = await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)
    await settlePushes()
    received = []

    await request(app)
      .delete(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    await waitForContentPush(0)
  })

  test("editing a group schedule pushes updated content to member devices", async () => {
    const groupId = await createGroup("Loja Centro")
    const scheduleId = await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)
    await settlePushes()
    received = []

    await request(app)
      .put(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ customFields: { text: "Editado" } })

    await waitForContentPush(1)
  })

  test("reassigning the device owner pushes content without the previous owner's group schedules", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)
    await settlePushes()
    received = []

    const newOwner = await createClientAndLogin("newowner@test.com")
    await request(app)
      .patch(`/api/devices/${deviceId}/owner`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ownerId: newOwner.userId })

    await waitForContentPush(0)
  })

  test("soft-deleting a group pushes updated content to member devices", async () => {
    const groupId = await createGroup("Loja Centro")
    await createGroupSchedule(groupId, "Conteúdo do grupo")
    await addDeviceToGroup(groupId)
    await settlePushes()
    received = []

    await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${clientToken}`)

    await waitForContentPush(0)
  })
})
