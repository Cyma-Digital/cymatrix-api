import { Request, Response, NextFunction } from "express"
import groupService from "@/services/group/group.service"
import {
  AddGroupDeviceDto,
  CreateGroupDto,
  UpdateGroupDto,
  groupDeviceParamsSchema,
  groupIdSchema,
} from "@/schemas/group/group.schemas"

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as CreateGroupDto
    const userId = req.user!.userId
    const group = await groupService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })
    return res.status(201).json({
      status: "success",
      data: group,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const groups = await groupService.listAll(userId)
    return res.status(200).json({
      status: "success",
      data: groups,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = groupIdSchema.parse(req.params)
    const userId = req.user!.userId
    const group = await groupService.getById(id, userId)
    return res.status(200).json({
      status: "success",
      data: group,
    })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = groupIdSchema.parse(req.params)
    const data = req.body as UpdateGroupDto
    const userId = req.user!.userId
    const group = await groupService.update(id, {
      ...data,
      updatedBy: userId,
    })
    return res.status(200).json({
      status: "success",
      data: group,
    })
  } catch (error) {
    next(error)
  }
}

export async function addDevice(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = groupIdSchema.parse(req.params)
    const { deviceIds } = req.body as AddGroupDeviceDto
    const userId = req.user!.userId
    const group = await groupService.addDevices(id, deviceIds, userId)
    return res.status(201).json({
      status: "success",
      data: group,
    })
  } catch (error) {
    next(error)
  }
}

export async function removeDevice(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, deviceId } = groupDeviceParamsSchema.parse(req.params)
    const userId = req.user!.userId
    await groupService.removeDevice(id, deviceId, userId)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export async function deleteGroup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = groupIdSchema.parse(req.params)
    const userId = req.user!.userId
    await groupService.delete(id, userId)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
