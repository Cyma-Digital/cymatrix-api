import request from "supertest"
import app from "@/app"
import prisma from "@/lib/prisma"
import { orchestrator } from "tests/helpers/orchestrator"
import { loginAndGetToken } from "tests/helpers/auth"

// Stub the geocoding module so metrics-ingest tests never hit the live Google
// API — offline-safe, no quota cost, no flakiness.
const geocodeMock = vi.hoisted(() => ({
  reverseGeocode: vi.fn(),
}))

// Mock only the network call — keep the real distanceMeters so the service's
// jitter/relocation gate runs as in production.
vi.mock("@/lib/geocode", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/geocode")>("@/lib/geocode")
  return { ...actual, reverseGeocode: geocodeMock.reverseGeocode }
})

beforeEach(async () => {
  geocodeMock.reverseGeocode.mockReset()
  await orchestrator.setup()
})

afterAll(async () => {
  await orchestrator.tearDown()
})

describe("PATCH /api/devices/:code/metrics", () => {
  describe("Anonymous user", () => {
    test("should update device metrics without authentication", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      expect(response.status).toBe(204)
    })
  })

  describe("Validation", () => {
    test("should return 404 when device code does not exist", async () => {
      const response = await request(app)
        .patch("/api/devices/INVALID999/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      expect(response.status).toBe(404)
      expect(response.body.status).toBe("error")
      expect(response.body.message).toBe("Device not found")
    })

    test("should return 400 when localization is missing", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })

    test("should return 400 when lat or lng are missing", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054 } })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })

    test("should return 400 when lat or lng are out of range", async () => {
      const token = await loginAndGetToken()
      await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: 9999, lng: -8000 } })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe("error")
    })
  })

  describe("Persistence", () => {
    test("should persist metrics on device", async () => {
      const token = await loginAndGetToken()
      const createResponse = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const device = createResponse.body.data

      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(getResponse.body.data.metrics).toMatchObject({
        localization: {
          lat: -23.3054,
          lng: -45.9631,
        },
      })
    })

    test("should stamp updatedAt timestamp on metrics", async () => {
      const token = await loginAndGetToken()
      const createResponse = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })

      const device = createResponse.body.data

      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({
          localization: {
            lat: -23.3054,
            lng: -45.9631,
          },
        })

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      const { updatedAt } = getResponse.body.data.metrics
      expect(typeof updatedAt).toBe("string")
      expect(Number.isNaN(Date.parse(updatedAt))).toBe(false)
    })
  })

  describe("Reverse geocoding", () => {
    async function createDevice(token: string) {
      const res = await request(app)
        .post("/api/devices")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mercado Central", code: "MKT001" })
      return res.body.data
    }

    test("geocodes new coordinates and persists the address", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue({
        formattedAddress: "Av. Paulista, 1000 - São Paulo, SP",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054, lng: -45.9631 } })

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(geocodeMock.reverseGeocode).toHaveBeenCalledWith(
        -23.3054,
        -45.9631,
      )
      expect(getResponse.body.data.metrics.localization).toMatchObject({
        lat: -23.3054,
        lng: -45.9631,
        address: "Av. Paulista, 1000 - São Paulo, SP",
      })
    })

    test("does not re-geocode when coordinates are unchanged", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue({
        formattedAddress: "Av. Paulista, 1000 - São Paulo, SP",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const payload = { localization: { lat: -23.3054, lng: -45.9631 } }

      await request(app).patch("/api/devices/MKT001/metrics").send(payload)
      await request(app).patch("/api/devices/MKT001/metrics").send(payload)

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(geocodeMock.reverseGeocode).toHaveBeenCalledTimes(1)
      expect(getResponse.body.data.metrics.localization.address).toBe(
        "Av. Paulista, 1000 - São Paulo, SP",
      )
    })

    test("re-geocodes unchanged coordinates when no address was stored yet", async () => {
      // First tick fails to resolve (e.g. key/API unavailable) → address null.
      geocodeMock.reverseGeocode.mockResolvedValueOnce(null)
      // Second tick (same coords) should retry and self-heal.
      geocodeMock.reverseGeocode.mockResolvedValueOnce({
        formattedAddress: "Av. Paulista, 1000 - São Paulo, SP",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const payload = { localization: { lat: -23.3054, lng: -45.9631 } }
      await request(app).patch("/api/devices/MKT001/metrics").send(payload)
      await request(app).patch("/api/devices/MKT001/metrics").send(payload)

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(geocodeMock.reverseGeocode).toHaveBeenCalledTimes(2)
      expect(getResponse.body.data.metrics.localization.address).toBe(
        "Av. Paulista, 1000 - São Paulo, SP",
      )
    })

    test("does not re-geocode on GPS jitter within the distance threshold", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue({
        formattedAddress: "Av. Paulista, 1000 - São Paulo, SP",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      // ~12m apart (6th decimal place) — GPS noise, not a relocation.
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054, lng: -45.9631 } })
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.30551, lng: -45.96315 } })

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(geocodeMock.reverseGeocode).toHaveBeenCalledTimes(1)
      expect(getResponse.body.data.metrics.localization.address).toBe(
        "Av. Paulista, 1000 - São Paulo, SP",
      )
    })

    test("re-geocodes when the device moves beyond the distance threshold", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue({
        formattedAddress: "Av. Paulista, 1000 - São Paulo, SP",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054, lng: -45.9631 } })
      // ~1.5km away — a real relocation.
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3187, lng: -45.9631 } })

      await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(geocodeMock.reverseGeocode).toHaveBeenCalledTimes(2)
    })

    test("re-geocodes on cumulative drift from the anchor even when each step is small", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue({
        formattedAddress: "Av. Paulista, 1000 - São Paulo, SP",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      // Anchor set here.
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054, lng: -45.9631 } })
      // ~33m from anchor — within threshold, no geocode, anchor stays put.
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3057, lng: -45.9631 } })
      // ~67m from the original anchor (another ~33m further). vs-previous would
      // miss this; vs-anchor catches it.
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.306, lng: -45.9631 } })

      await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(geocodeMock.reverseGeocode).toHaveBeenCalledTimes(2)
    })

    test("does not re-geocode a legacy blob (no anchor) within the threshold", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue({
        formattedAddress: "Should not be called",
      })

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      // Seed a pre-anchor metrics blob: localization with a resolved address but
      // no `anchor` field, as written by the previous implementation.
      await prisma.device.update({
        where: { id: device.id },
        data: {
          metrics: {
            localization: {
              lat: -23.3054,
              lng: -45.9631,
              address: "Av. Paulista, 1000 - São Paulo, SP",
            },
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        },
      })

      // ~13m away — within threshold of the legacy localization used as anchor.
      await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.30551, lng: -45.96315 } })

      expect(geocodeMock.reverseGeocode).not.toHaveBeenCalled()
    })

    test("persists coordinates without address and still returns 204 when geocoding fails", async () => {
      geocodeMock.reverseGeocode.mockResolvedValue(null)

      const token = await loginAndGetToken()
      const device = await createDevice(token)

      const response = await request(app)
        .patch("/api/devices/MKT001/metrics")
        .send({ localization: { lat: -23.3054, lng: -45.9631 } })

      expect(response.status).toBe(204)

      const getResponse = await request(app)
        .get(`/api/devices/${device.id}`)
        .set("Authorization", `Bearer ${token}`)

      expect(getResponse.body.data.metrics.localization).toMatchObject({
        lat: -23.3054,
        lng: -45.9631,
        address: null,
      })
    })
  })
})
