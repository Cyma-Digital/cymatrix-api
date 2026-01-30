import { Router } from "express"
import status from "@/routes/status/status.routes"
import brand from "@/routes/brand/brand.routes"

const router = Router()

router.use("/status", status)
router.use("/brands", brand)

export default router
