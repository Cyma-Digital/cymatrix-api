import { Router } from "express"
import status from "@/routes/status/status.routes"
import brand from "@/routes/brand/brand.routes"
import user from "@/routes/user/user.routes"

const router = Router()

router.use("/status", status)
router.use("/brands", brand)
router.use("/users", user)

export default router
