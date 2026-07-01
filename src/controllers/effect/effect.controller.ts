import { Request, Response, NextFunction } from "express"
import effectService from "@/services/effect/effect.service"
import {
  CreateEffectDto,
  UpdateEffectDto,
  effectIdSchema,
} from "@/schemas/effect/effect.schemas"
import { validateIdParam } from "@/utils/http"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateEffectDto
    const userId = req.user!.userId
    const effect = await effectService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })
    return res.status(201).json({
      status: "success",
      data: effect,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId

    const effects = await effectService.listAll(userId)
    return res.status(200).json({
      status: "success",
      data: effects,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = effectIdSchema.parse(req.params)
    const effect = await effectService.getById(id)
    return res.status(200).json({
      status: "success",
      data: effect,
    })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = effectIdSchema.parse(req.params)
    const data = req.body as UpdateEffectDto
    const userId = req.user!.userId
    const effect = await effectService.update(id, {
      ...data,
      updatedBy: userId,
    })
    return res.status(200).json({
      status: "success",
      data: effect,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteEffect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)
    const userId = req.user!.userId
    await effectService.delete(id, userId)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
