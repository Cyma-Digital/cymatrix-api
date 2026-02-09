import { Router } from "express"
import * as categoryController from "@/controllers/category/category.controller"

const router = Router()

router.post("/", categoryController.create)
router.get("/", categoryController.list)
router.get("/:id", categoryController.getById)
router.patch("/:id", categoryController.updatePartial)
router.delete("/:id", categoryController.deleteCategory)

export default router
