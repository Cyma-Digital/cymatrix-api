import { Router } from "express"
import * as productController from "@/controllers/product/product.controller"

const router = Router()

router.post("/", productController.create)
router.get("/", productController.list)
router.get("/:id", productController.getById)
router.patch("/:id", productController.updatePartial)
router.delete("/:id", productController.deleteProduct)

export default router
