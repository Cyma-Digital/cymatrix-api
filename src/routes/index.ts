import { Router } from "express"
import status from "@/routes/status/status.routes"
import brand from "@/routes/brand/brand.routes"
import category from "@/routes/category/category.routes"
import product from "@/routes/product/product.routes"

const router = Router()

router.use("/status", status)
router.use("/brands", brand)
router.use("/categories", category)
router.use("/products", product)

export default router
