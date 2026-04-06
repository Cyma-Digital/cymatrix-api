import { Router } from "express"
import status from "@/routes/status/status.routes"
import user from "@/routes/user/user.routes"
import auth from "@/routes/auth/auth.routes"
import device from "@/routes/device/device.routes"
import template from "./template/template.routes"

const router = Router()

router.use("/status", status)
router.use("/users", user)
router.use("/devices", device)
router.use("/templates", template)

router.use("/auth", auth)

export default router
