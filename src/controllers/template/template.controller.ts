import { Request, Response, NextFunction } from "express"
import templateService from "@/services/template/template.service"
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  templateIdSchema,
} from "@/schemas/template/template.schemas"
import { validateIdParam } from "@/utils/http"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateTemplateDto
    const userId = req.user!.userId
    const template = await templateService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })
    return res.status(201).json({
      status: "success",
      data: template,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await templateService.listAll()
    return res.status(200).json({
      status: "success",
      data: templates,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = templateIdSchema.parse(req.params)
    const template = await templateService.getById(id)
    return res.status(200).json({
      status: "success",
      data: template,
    })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = templateIdSchema.parse(req.params)
    const data = req.body as UpdateTemplateDto
    const userId = req.user!.userId
    const template = await templateService.update(id, {
      ...data,
      updatedBy: userId,
    })
    return res.status(200).json({
      status: "success",
      data: template,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteTemplate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)
    const userId = req.user!.userId
    await templateService.delete(id, userId)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
