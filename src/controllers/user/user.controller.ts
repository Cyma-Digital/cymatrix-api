import { Request, Response, NextFunction } from "express"
import userService from "@/services/user/user.service"
import {
  CreateUserDto,
  UpdateUserDto,
  userIdSchema,
} from "@/schemas/user/user.schemas"
import { validateIdParam } from "@/utils/http"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateUserDto
    const userId = 1

    const user = await userService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })

    return res.status(201).json({
      status: "success",
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listAll()
    return res.status(200).json({
      status: "success",
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userIdSchema.parse(req.params)

    const user = await userService.getById(id)

    return res.status(200).json({
      status: "success",
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = userIdSchema.parse(req.params)
    const data = req.body as UpdateUserDto
    const userId = 1

    const user = await userService.update(id, {
      ...data,
      updatedBy: userId,
    })

    return res.status(200).json({
      status: "success",
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)

    const userId = 1

    await userService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
