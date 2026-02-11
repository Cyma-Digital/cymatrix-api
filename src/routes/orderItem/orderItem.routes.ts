import { Router } from "express"
import * as orderItemController from "@/controllers/orderItem/orderItem.controller"

const router = Router()

router.post("/", orderItemController.create)

export default router
