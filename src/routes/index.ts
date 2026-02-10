import { Router } from "express"
import status from "@/routes/status/status.routes"
import brand from "@/routes/brand/brand.routes"
import user from "@/routes/user/user.routes"
import category from "@/routes/category/category.routes"
import product from "@/routes/product/product.routes"
import address from "@/routes/address/address.routes"

const router = Router()

router.use("/status", status)
router.use("/brands", brand)
router.use("/users", user)
router.use("/categories", category)
router.use("/products", product)
router.use("/addresses", address)

export default router
