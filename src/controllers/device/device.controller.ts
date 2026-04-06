import { Request, Response, NextFunction } from "express"
import deviceService from "@/services/device/device.service"
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  deviceIdSchema,
} from "@/schemas/device/device.schemas"
import { validateIdParam } from "@/utils/http"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateDeviceDto
    const userId = req.user!.userId
    const device = await deviceService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })
    return res.status(201).json({
      status: "success",
      data: device,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const devices = await deviceService.listAll()
    return res.status(200).json({
      status: "success",
      data: devices,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = deviceIdSchema.parse(req.params)
    const device = await deviceService.getById(id)
    return res.status(200).json({
      status: "success",
      data: device,
    })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = deviceIdSchema.parse(req.params)
    const data = req.body as UpdateDeviceDto
    const userId = req.user!.userId
    const device = await deviceService.update(id, {
      ...data,
      updatedBy: userId,
    })
    return res.status(200).json({
      status: "success",
      data: device,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteDevice(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)
    const userId = req.user!.userId
    await deviceService.delete(id, userId)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
