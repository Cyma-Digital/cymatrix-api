import { Router } from "express"
import statusController from "@/controllers/status/status.controller"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.use(authenticate)

router.get("/", statusController)

export default router
