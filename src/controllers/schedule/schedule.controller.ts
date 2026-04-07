import { Request, Response, NextFunction } from "express"
import contentScheduleService from "@/services/schedule/schedule.service"
import {
  CreateContentScheduleDto,
  UpdateContentScheduleDto,
  contentScheduleIdSchema,
} from "@/schemas/schedule/schedule.schemas"
import { validateIdParam } from "@/utils/http"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateContentScheduleDto
    const userId = req.user!.userId
    const schedule = await contentScheduleService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })
    return res.status(201).json({
      status: "success",
      data: schedule,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const schedules = await contentScheduleService.listAll()
    return res.status(200).json({
      status: "success",
      data: schedules,
    })
  } catch (error) {
    next(error)
  }
}

export async function listByDevice(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = contentScheduleIdSchema.parse(req.params)
    const schedules = await contentScheduleService.listByDeviceId(id)
    return res.status(200).json({
      status: "success",
      data: schedules,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = contentScheduleIdSchema.parse(req.params)
    const schedule = await contentScheduleService.getById(id)
    return res.status(200).json({
      status: "success",
      data: schedule,
    })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = contentScheduleIdSchema.parse(req.params)
    const data = req.body as UpdateContentScheduleDto
    const userId = req.user!.userId
    const schedule = await contentScheduleService.update(id, {
      ...data,
      updatedBy: userId,
    })
    return res.status(200).json({
      status: "success",
      data: schedule,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteSchedule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)
    const userId = req.user!.userId
    await contentScheduleService.delete(id, userId)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
