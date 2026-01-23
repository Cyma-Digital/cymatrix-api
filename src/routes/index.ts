import { Router } from "express"
import status from "@/routes/status/status.routes"

const router = Router()

router.use("/status", status)

export default router
