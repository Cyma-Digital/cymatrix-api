import { Router } from "express"
import * as orderItemController from "@/controllers/orderItem/orderItem.controller"

const router = Router()

router.post("/", orderItemController.create)
router.get("/", orderItemController.list)
router.get("/:id", orderItemController.getById)
router.patch("/:id", orderItemController.updatePartial)

export default router
