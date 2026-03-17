import { validateBody } from "@/middlewares/validate.middleware"
import { loginSchema } from "@/schemas/auth/auth.schemas"
import * as authController from "@/controllers/auth/auth.controller"
import { Router } from "express"

const router = Router()

router.post("/login", validateBody(loginSchema), authController.login)

export default router
