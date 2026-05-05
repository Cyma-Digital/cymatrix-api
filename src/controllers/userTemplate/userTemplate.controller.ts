import {
  CreateUserTemplateSchema,
  userTemplateIdSchema,
} from "@/schemas/userTemplate/userTemplate.schemas"
import userTemplateService from "@/services/userTemplate/userTemplate.service"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateUserTemplateSchema
    // const userId = req.user!.userId

    const userTemplate = await userTemplateService.create(data)

    return res.status(201).json({
      status: "success",
      data: userTemplate,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userTemplates = await userTemplateService.listAll()

    return res.status(200).json({
      status: "success",
      data: userTemplates,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userTemplateIdSchema.parse(req.params)

    const userTemplate = await userTemplateService.getById(id)

    return res.status(200).json({
      status: "success",
      data: userTemplate,
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
    const { id } = userTemplateIdSchema.parse(req.params)

    const userTemplate = await userTemplateService.getByUserId(id)

    return res.status(200).json({
      status: "success",
      data: userTemplate,
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
    const { id } = userTemplateIdSchema.parse(req.params)

    const userTemplate = await userTemplateService.getByTemplateId(id)

    return res.status(200).json({
      status: "success",
      data: userTemplate,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteUserTemplate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = userTemplateIdSchema.parse(req.params)

    await userTemplateService.delete(id)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
