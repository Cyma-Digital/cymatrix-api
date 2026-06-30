import { HttpError } from "@/errors/httpError"
import DeviceRepository, {
  DeviceMetricsBlob,
} from "@/repositories/device/device.respository"
import {
  CreateDeviceServiceInput,
  UpdateDeviceServiceInput,
  UpdateDeviceMetrics,
} from "@/schemas/device/device.schemas"
import { Prisma } from "@/generated/prisma/client"
import userRepository from "@/repositories/user/user.repository"
import scheduleService from "../schedule/schedule.service"
import { reverseGeocode, distanceMeters } from "@/lib/geocode"

// Minimum movement (meters) before a stored address is re-resolved. GPS jitter
// for a stationary device is typically <15m, so 50m ignores noise while still
// catching a genuine relocation. A fixed device geocodes once and never again.
const GEOCODE_DISTANCE_THRESHOLD_M = 50

// Read-only view of the persisted metrics blob, used to compare the previously
// stored position against an incoming report. Field shapes are derived from the
// canonical DeviceMetricsBlob (the write side) so the two can't drift; both are
// nullable here because a device may have no metrics yet, or a legacy blob
// written before `anchor` existed.
interface StoredMetrics {
  localization?: DeviceMetricsBlob["localization"] | null
  anchor?: DeviceMetricsBlob["anchor"] | null
}

export class DeviceService {
  constructor(private repository = DeviceRepository) {}

  async create(data: CreateDeviceServiceInput) {
    const device = await this.repository.getByCode(data.code)
    if (device) {
      throw new HttpError(409, "Device code already exists.")
    }

    return await this.repository.create(data)
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(deviceId: number) {
    const device = await this.repository.getById(deviceId)
    if (!device) throw new HttpError(404, "Device not found")
    return device
  }

  async getByCode(code: string) {
    const device = await this.repository.getByCode(code)
    if (!device) throw new HttpError(404, "Device not found")
    return device
  }

  async findByCode(code: string) {
    return this.repository.getByCode(code) // retorna Device | null
  }

  async update(deviceId: number, data: UpdateDeviceServiceInput) {
    const existingDevice = await this.repository.getById(deviceId)
    if (!existingDevice) {
      throw new HttpError(404, "Device not found")
    }

    if (data.code && data.code !== existingDevice.code) {
      const deviceWithCode = await this.repository.getByCode(data.code)
      if (deviceWithCode && deviceWithCode.id !== deviceId) {
        throw new HttpError(409, "Device code already exists")
      }
    }

    return await this.repository.update(deviceId, data)
  }

  async updateDeviceStatus(code: string, status: "Online" | "Offline") {
    try {
      const device = await this.repository.getByCode(code)
      if (device) {
        await this.repository.updateStatus(device.id, status)
      }
    } catch (error) {
      console.log(`[ws] Failed to update device status: ${error}`)
    }
  }

  async delete(deviceId: number, deletedBy: number) {
    const device = await this.repository.getById(deviceId)
    if (!device) {
      throw new HttpError(404, "Device not found")
    }

    try {
      await this.repository.softDelete(deviceId, deletedBy)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete device")
    }
  }

  async updateStatus(id: number, status: "Online" | "Offline") {
    return this.repository.updateStatus(id, status)
  }

  async assignOwner(
    deviceId: number,
    ownerId: number | null,
    updatedBy: number,
  ) {
    if (ownerId !== null) {
      const device = await this.repository.getById(deviceId)
      if (!device) throw new HttpError(404, "Device not found")
    }

    if (ownerId !== null) {
      const owner = await userRepository.getById(ownerId)
      if (!owner) throw new HttpError(404, "User not found")
    }

    return this.repository.update(deviceId, { ownerId, updatedBy })
  }

  async updateOverrides(
    deviceId: number,
    deviceOverrides: unknown,
    updatedBy: number,
  ) {
    const device = await this.repository.getById(deviceId)
    if (!device) throw new HttpError(404, "Device not found")

    const updated = await this.repository.updateOverrides(
      deviceId,
      (deviceOverrides ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      updatedBy,
    )

    await scheduleService.pushCurrentContent(deviceId)

    return updated
  }

  async updateDataJson(deviceId: number, dataJson: unknown, updatedBy: number) {
    const device = await this.repository.getById(deviceId)
    if (!device) throw new HttpError(404, "Device not found")

    return await this.repository.updateDataJson(
      deviceId,
      (dataJson ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      updatedBy,
    )
  }

  async updateDeviceMetrics(
    deviceCode: string,
    data: UpdateDeviceMetrics,
  ): Promise<void> {
    const device = await this.findByCode(deviceCode)
    if (!device) throw new HttpError(404, "Device not found")

    // Read-modify-write on the metrics blob is NOT serialized: this read sits
    // outside the write transaction (and a row lock can't span the geocode
    // network call without risking a tx timeout). Two overlapping PATCHes for
    // the same device therefore race. Accepted by design: the location write is
    // last-writer-wins, which is the desired semantics (newest GPS reading
    // should win), and the only cost is a possible redundant geocode call for
    // the loser — not data corruption. Devices push on a timer, so concurrent
    // same-device writes are rare; serializing the hot path isn't worth it.
    const { lat, lng } = data.localization
    const stored = device.metrics as StoredMetrics | null
    const previous = stored?.localization
    // Anchor = coordinates of the last geocode *attempt* (not necessarily a
    // successful one). It advances on every attempt so a failed/empty resolve
    // can't leave the distance gate permanently open and re-geocode via `moved`
    // every tick. Fall back to the last stored position for devices written
    // before anchors existed, so the migration is seamless.
    const anchor =
      stored?.anchor ??
      (previous ? { lat: previous.lat, lng: previous.lng } : null)

    // Geocode when the device moved beyond the jitter threshold OR when we still
    // have no address for it (never resolved — e.g. key/API unavailable at the
    // time). The latter lets devices self-heal on the next metrics tick once
    // geocoding works, while still skipping the call once an address is stored.
    // Measuring displacement from the anchor (not the last report) keeps GPS
    // noise from re-geocoding a stationary device and avoids the anchor drifting
    // with jitter. Geocoding failure must never block ingestion.
    //
    // TODO: a location Google can never resolve (ZERO_RESULTS — e.g. open water)
    // keeps `missingAddress` true and re-geocodes every tick. Out of scope for
    // fixed devices at real addresses; if it surfaces, distinguish a permanent
    // empty result from a transient error and stop retrying the former.
    const moved =
      !anchor ||
      distanceMeters(anchor.lat, anchor.lng, lat, lng) >
        GEOCODE_DISTANCE_THRESHOLD_M
    const missingAddress = !previous?.address

    let address: string | null
    let nextAnchor: { lat: number; lng: number }
    if (moved || missingAddress) {
      const geocoded = await reverseGeocode(lat, lng)
      address = geocoded?.formattedAddress ?? null
      // Advance on attempt (see anchor note above), not only on success.
      nextAnchor = { lat, lng }
    } else {
      address = previous.address ?? null
      nextAnchor = anchor
    }

    await this.repository.updateDeviceMetrics(device.id, {
      localization: { lat, lng, address },
      anchor: nextAnchor,
    })
  }
}

export default new DeviceService()
