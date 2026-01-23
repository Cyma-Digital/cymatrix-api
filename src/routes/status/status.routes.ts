import { Router } from "express"
import statusController from "@/controllers/status/status.controller"

const router = Router()

router.get("/", statusController)

export default router
