import request from "supertest"
import app from "@/app"
import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"
import { metricsHistoryRateLimit } from "@/routes/device/device.routes"

beforeEach(async () => {
  await orchestrator.setup()
  metricsHistoryRateLimit.reset()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

async function createDevice(token: string) {
  const res = await request(app)
    .post("/api/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Mercado Central", code: "MKT001" })
  return res.body.data
}

async function seedHistory(deviceId: number, data: object, createdAt: Date) {
  return prisma.deviceMetricsHistory.create({
    data: {
      deviceId,
      data: data as Prisma.InputJsonValue,
      createdAt,
    },
  })
}

describe("GET /api/devices/:id/metrics/history", () => {
  describe("Anonymous user", () => {
    test("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/devices/1/metrics/history")

      expect(response.status).toBe(401)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Validation", () => {
    test("should return 404 when device does not exist", async () => {
      const token = await loginAndGetToken()

      const response = await request(app)
        .get("/api/devices/99999/metrics/history")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBe("Device not found")
    })

    test("should return 404 when device is soft-deleted", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await request(app)
        .delete(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(404)
    })

    test("should return 400 when id is not numeric", async () => {
      const token = await loginAndGetToken()

      const response = await request(app)
        .get("/api/devices/abc/metrics/history")
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })

    test("should return 400 when from is not a valid ISO date", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history?from=not-a-date`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })

    test("should return 400 when limit is not a positive integer", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history?limit=abc`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })

    test("should return 400 when limit exceeds the server-enforced maximum", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history?limit=1001`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Reading history", () => {
    test("should return an empty array when there is no history", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe("success")
      expect(response.body.data).toEqual({ entries: [], truncated: false })
    })

    test("should return entries newest-first with lat, lng, address, recordedAt", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await seedHistory(
        device.id,
        {
          localization: {
            lat: -23.3054,
            lng: -45.9631,
            address: "Old address",
          },
        },
        new Date("2026-01-01T00:00:00.000Z"),
      )
      await seedHistory(
        device.id,
        { localization: { lat: -23.31, lng: -45.97, address: "New address" } },
        new Date("2026-01-02T00:00:00.000Z"),
      )

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({
        entries: [
          {
            lat: -23.31,
            lng: -45.97,
            address: "New address",
            recordedAt: "2026-01-02T00:00:00.000Z",
          },
          {
            lat: -23.3054,
            lng: -45.9631,
            address: "Old address",
            recordedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        truncated: false,
      })
    })

    test("should pass through a null address", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await seedHistory(
        device.id,
        { localization: { lat: -23.3054, lng: -45.9631, address: null } },
        new Date("2026-01-01T00:00:00.000Z"),
      )

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({
        entries: [
          {
            lat: -23.3054,
            lng: -45.9631,
            address: null,
            recordedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        truncated: false,
      })
    })

    test("should exclude rows missing valid coordinates", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await seedHistory(
        device.id,
        { localization: { lat: -23.3054, lng: -45.9631, address: "Valid" } },
        new Date("2026-01-01T00:00:00.000Z"),
      )
      // Missing localization entirely.
      await seedHistory(device.id, {}, new Date("2026-01-02T00:00:00.000Z"))
      // Non-finite / non-numeric coordinates.
      await seedHistory(
        device.id,
        { localization: { lat: "bad", lng: -45.9631, address: "Bad lat" } },
        new Date("2026-01-03T00:00:00.000Z"),
      )

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.entries).toHaveLength(1)
      expect(response.body.data.entries[0].address).toBe("Valid")
      expect(response.body.data.truncated).toBe(false)
    })

    test("should filter by from/to createdAt range", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await seedHistory(
        device.id,
        { localization: { lat: -1, lng: -1, address: "Day 1" } },
        new Date("2026-01-01T00:00:00.000Z"),
      )
      await seedHistory(
        device.id,
        { localization: { lat: -2, lng: -2, address: "Day 2" } },
        new Date("2026-01-02T00:00:00.000Z"),
      )
      await seedHistory(
        device.id,
        { localization: { lat: -3, lng: -3, address: "Day 3" } },
        new Date("2026-01-03T00:00:00.000Z"),
      )

      const response = await request(app)
        .get(
          `/api/devices/${device.id}/metrics/history?from=2026-01-02T00:00:00.000Z&to=2026-01-02T23:59:59.000Z`,
        )
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.entries).toHaveLength(1)
      expect(response.body.data.entries[0].address).toBe("Day 2")
    })

    test("should cap results with the limit query param and report truncation", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await seedHistory(
        device.id,
        { localization: { lat: -1, lng: -1, address: "A" } },
        new Date("2026-01-01T00:00:00.000Z"),
      )
      await seedHistory(
        device.id,
        { localization: { lat: -2, lng: -2, address: "B" } },
        new Date("2026-01-02T00:00:00.000Z"),
      )
      await seedHistory(
        device.id,
        { localization: { lat: -3, lng: -3, address: "C" } },
        new Date("2026-01-03T00:00:00.000Z"),
      )

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history?limit=2`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.entries).toHaveLength(2)
      expect(response.body.data.entries[0].address).toBe("C")
      expect(response.body.data.entries[1].address).toBe("B")
      expect(response.body.data.truncated).toBe(true)
    })

    test("should not report truncation when the row count equals the limit", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await seedHistory(
        device.id,
        { localization: { lat: -1, lng: -1, address: "A" } },
        new Date("2026-01-01T00:00:00.000Z"),
      )
      await seedHistory(
        device.id,
        { localization: { lat: -2, lng: -2, address: "B" } },
        new Date("2026-01-02T00:00:00.000Z"),
      )

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history?limit=2`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.entries).toHaveLength(2)
      expect(response.body.data.truncated).toBe(false)
    })
  })

  describe("Rate limiting", () => {
    test("should return 429 after exceeding the per-user request limit", async () => {
      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const allowed = await Promise.all(
        Array.from({ length: 60 }, () =>
          request(app)
            .get(`/api/devices/${device.id}/metrics/history`)
            .set("Authorization", `Bearer ${token}`),
        ),
      )
      for (const res of allowed) expect(res.status).toBe(200)

      const response = await request(app)
        .get(`/api/devices/${device.id}/metrics/history`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(429)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBe("Too many requests")
    })
  })
})
