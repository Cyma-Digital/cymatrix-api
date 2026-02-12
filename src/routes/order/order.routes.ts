import { Router } from "express"
import * as orderController from "@/controllers/order/order.controller"

const router = Router()

router.post("/", orderController.create)
router.get("/", orderController.list)
router.get("/:id", orderController.getById)
router.get("/order-items/:id", orderController.getOrderWithOrderItems)
router.patch("/:id", orderController.updatePartial)
router.delete("/:id", orderController.deleteOrder)

export default router
