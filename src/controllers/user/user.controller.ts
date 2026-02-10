import { Request, Response, NextFunction } from "express"
import userService, { CreateUserInput } from "@/services/user/user.service"

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
