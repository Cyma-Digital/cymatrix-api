import { Router } from "express"
import * as addressController from "@/controllers/address/address.controller"

const router = Router()

router.post("/", addressController.create)

export default router
