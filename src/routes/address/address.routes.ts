import { Router } from "express"
import * as addressController from "@/controllers/address/address.controller"

const router = Router()

router.post("/", addressController.create)
router.get("/", addressController.list)
router.get("/:id", addressController.getById)

export default router
