import { describe, it, expect, beforeEach, afterAll } from "vitest"
import request from "supertest"
import app from "../../../../src/app"
import { orchestrator } from "tests/helpers/orchestrator"

const ADMIN_CREDENTIALS = { email: "admin@test.com", password: "admin123" }

async function loginAsAdmin() {
  const res = await request(app).post("/api/auth/login").send(ADMIN_CREDENTIALS)
  return res.body.data.access
}

async function createUser(adminToken: string, opts: { role?: string } = {}) {
  const email = `user-${Date.now()}-${Math.random()}@test.com`
  const res = await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      firstName: "Test",
      lastName: "User",
      email,
      phone: "11999999999",
      password: "password123",
      role: opts.role ?? "CLIENT",
    })
  return { user: res.body.data, email, password: "password123" }
}

async function createDevice(
  adminToken: string,
  opts: { ownerId?: number } = {},
) {
  const res = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: `Device ${Date.now()}`,
      code: `CODE-${Date.now()}-${Math.random()}`,
      ...(opts.ownerId !== undefined && { ownerId: opts.ownerId }),
    })
  return res.body.data
}

describe("PATCH /api/devices/:id/owner", () => {
  beforeEach(async () => {
    await orchestrator.setup()
  })

  afterAll(async () => {
    await orchestrator.tearDown()
  })

  describe("Anonymous", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app)
        .patch("/api/devices/1/owner")
        .send({ ownerId: 1 })

      expect(res.status).toBe(401)
    })
  })

  describe("Authenticated as ADMIN", () => {
    describe("Success", () => {
      it("assigns an owner to a device", async () => {
        const adminToken = await loginAsAdmin()
        const device = await createDevice(adminToken)
        const { user: newOwner } = await createUser(adminToken, {
          role: "CLIENT",
        })

        const res = await request(app)
          .patch(`/api/devices/${device.id}/owner`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ownerId: newOwner.id })

        expect(res.status).toBe(200)
        expect(res.body.data.ownerId).toBe(newOwner.id)
      })

      it("removes an owner when ownerId is null", async () => {
        const adminToken = await loginAsAdmin()
        const { user: owner } = await createUser(adminToken, { role: "CLIENT" })
        const device = await createDevice(adminToken, { ownerId: owner.id })

        const res = await request(app)
          .patch(`/api/devices/${device.id}/owner`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ownerId: null })

        expect(res.status).toBe(200)
        expect(res.body.data.ownerId).toBeNull()
      })

      it("reassigns an owner from one user to another", async () => {
        const adminToken = await loginAsAdmin()
        const { user: firstOwner } = await createUser(adminToken, {
          role: "CLIENT",
        })
        const { user: secondOwner } = await createUser(adminToken, {
          role: "CLIENT",
        })
        const device = await createDevice(adminToken, {
          ownerId: firstOwner.id,
        })

        const res = await request(app)
          .patch(`/api/devices/${device.id}/owner`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ownerId: secondOwner.id })

        expect(res.status).toBe(200)
        expect(res.body.data.ownerId).toBe(secondOwner.id)
      })
    })

    describe("Error", () => {
      it("returns 404 when device does not exist", async () => {
        const adminToken = await loginAsAdmin()
        const { user: owner } = await createUser(adminToken, { role: "CLIENT" })

        const res = await request(app)
          .patch("/api/devices/99999/owner")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ownerId: owner.id })

        expect(res.status).toBe(404)
      })

      it("returns 404 when ownerId references nonexistent user", async () => {
        const adminToken = await loginAsAdmin()
        const device = await createDevice(adminToken)

        const res = await request(app)
          .patch(`/api/devices/${device.id}/owner`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ownerId: 99999 })

        expect(res.status).toBe(404)
      })

      it("returns 400 when ownerId is missing", async () => {
        const adminToken = await loginAsAdmin()
        const device = await createDevice(adminToken)

        const res = await request(app)
          .patch(`/api/devices/${device.id}/owner`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({})

        expect(res.status).toBe(400)
      })

      it("returns 400 when ownerId is a string", async () => {
        const adminToken = await loginAsAdmin()
        const device = await createDevice(adminToken)

        const res = await request(app)
          .patch(`/api/devices/${device.id}/owner`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ ownerId: "5" })

        expect(res.status).toBe(400)
      })
    })
  })
})
