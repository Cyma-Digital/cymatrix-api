import { validateBody } from "@/middlewares/validate.middleware"
import { loginSchema } from "@/schemas/auth/auth.schemas"
import * as authController from "@/controllers/auth/auth.controller"
import { Router } from "express"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.post("/login", validateBody(loginSchema), authController.login)
router.post("/refresh", authController.refresh)
router.post("/logout", authenticate, authController.logout)
router.get("/me", authenticate, authController.me)

export default router
