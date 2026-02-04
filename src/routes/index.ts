import { Router } from "express"
import status from "@/routes/status/status.routes"
import brand from "@/routes/brand/brand.routes"
import category from "@/routes/category/category.routes"

const router = Router()

router.use("/status", status)
router.use("/brands", brand)
router.use("/categories", category)

export default router
