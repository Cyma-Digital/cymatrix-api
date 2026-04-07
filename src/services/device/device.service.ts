import { HttpError } from "@/errors/httpError"
import DeviceRepository from "@/repositories/device/device.respository"
import {
  CreateDeviceServiceInput,
  UpdateDeviceServiceInput,
} from "@/schemas/device/device.schemas"

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
}

export default new DeviceService()
