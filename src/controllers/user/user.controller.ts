import { Request, Response, NextFunction } from "express"
import userService, { CreateUserInput } from "@/services/user/user.service"
import { userIdSchema } from "@/schemas/user"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateUserInput
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
