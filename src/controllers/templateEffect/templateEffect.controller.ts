import {
  CreateTemplateEffectSchema,
  templateEffectIdSchema,
} from "@/schemas/templateEffect/templateEffect.schemas"
import templateEffectService from "@/services/templateEffect/templateEffect.service"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateTemplateEffectSchema

    const templateEffect = await templateEffectService.create(data)

    return res.status(201).json({
      status: "success",
      data: templateEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const templateEffects = await templateEffectService.listAll()

    return res.status(200).json({
      status: "success",
      data: templateEffects,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = templateEffectIdSchema.parse(req.params)

    const templateEffect = await templateEffectService.getById(id)

    return res.status(200).json({
      status: "success",
      data: templateEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function getByTemplateId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { id } = templateEffectIdSchema.parse(req.params)

    const templateEffect = await templateEffectService.getByTemplateId(id)

    return res.status(200).json({
      status: "success",
      data: templateEffect,
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
    const { id } = templateEffectIdSchema.parse(req.params)

    const templateEffect = await templateEffectService.getByEffectId(id)

    return res.status(200).json({
      status: "success",
      data: templateEffect,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteTemplateEffect(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = templateEffectIdSchema.parse(req.params)

    await templateEffectService.delete(id)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
