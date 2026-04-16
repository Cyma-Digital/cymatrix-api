import { LoginInput } from "@/schemas/auth/auth.schemas"
import { Request, Response, NextFunction } from "express"
import authService from "@/services/auth/auth.service"
import userService from "@/services/user/user.service"
import { HttpError } from "@/errors/httpError"

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
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({
      status: "success",
      data: {
        access: result.accessToken,
        user: result.user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    if (!req.user) {
      throw new HttpError(404, "Not found")
    }

    const user = await userService.getById(req.user.userId)

    return res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        seccess: false,
        message: "Refresh token missing",
      })
    }

    const result = await authService.refresh(refreshToken)

    res.status(200).json({
      success: true,
      data: {
        access: result.accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })

    return res.status(200).json({
      success: true,
      message: "Logged out succesfully",
    })
  } catch (error) {
    next(error)
  }
}
