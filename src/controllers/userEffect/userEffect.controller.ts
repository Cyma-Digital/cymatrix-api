import {
  CreateUserEffectSchema,
  userEffectIdSchema,
} from "@/schemas/userEffect/userEffect.schemas"
import userEffectService from "@/services/userEffect/userEffect.service"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateUserEffectSchema

    const userEffect = await userEffectService.create(data)

    return res.status(201).json({
      status: "success",
      data: userEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userEffects = await userEffectService.listAll()

    return res.status(200).json({
      status: "success",
      data: userEffects,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userEffectIdSchema.parse(req.params)

    const userEffect = await userEffectService.getById(id)

    return res.status(200).json({
      status: "success",
      data: userEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function getByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { id } = userEffectIdSchema.parse(req.params)

    const userEffect = await userEffectService.getByUserId(id)

    return res.status(200).json({
      status: "success",
      data: userEffect,
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
    const { id } = userEffectIdSchema.parse(req.params)

    const userEffect = await userEffectService.getByEffectId(id)

    return res.status(200).json({
      status: "success",
      data: userEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteUserEffect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = userEffectIdSchema.parse(req.params)

    await userEffectService.delete(id)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
