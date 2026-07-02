import {
  CreateScheduleEffectSchema,
  scheduleEffectIdSchema,
} from "@/schemas/scheduleEffect/scheduleEffect.schemas"
import scheduleEffectService from "@/services/scheduleEffect/scheduleEffect.service"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateScheduleEffectSchema

    const scheduleEffect = await scheduleEffectService.create(data)

    return res.status(201).json({
      status: "success",
      data: scheduleEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const scheduleEffects = await scheduleEffectService.listAll()

    return res.status(200).json({
      status: "success",
      data: scheduleEffects,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = scheduleEffectIdSchema.parse(req.params)

    const scheduleEffect = await scheduleEffectService.getById(id)

    return res.status(200).json({
      status: "success",
      data: scheduleEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function getByScheduleId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { id } = scheduleEffectIdSchema.parse(req.params)

    const scheduleEffect = await scheduleEffectService.getByScheduleId(id)

    return res.status(200).json({
      status: "success",
      data: scheduleEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function getByEffectId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { id } = scheduleEffectIdSchema.parse(req.params)

    const scheduleEffect = await scheduleEffectService.getByEffectId(id)

    return res.status(200).json({
      status: "success",
      data: scheduleEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteScheduleEffect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = scheduleEffectIdSchema.parse(req.params)

    await scheduleEffectService.delete(id)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
