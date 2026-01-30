import { Router } from "express"
import * as brandController from "@/controllers/brand/brand.controller"

const router = Router()

router.get("/", brandController.list)
router.get("/:id", brandController.getById)
router.post("/", brandController.create)
router.patch("/:id", brandController.updatePartial)
router.delete("/:id", brandController.deleteBrand)

export default router
