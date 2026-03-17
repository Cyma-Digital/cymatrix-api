import { LoginInput } from "@/schemas/auth/auth.schemas"
import { Request, Response, NextFunction } from "express"
import authService from "@/services/auth/auth.service"

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data: LoginInput = req.body
    const result = await authService.login(data)

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      success: true,
      data: {
        access: result.accessToken,
        user: result.user,
      },
    })
  } catch (error) {
    next(error)
  }
}
